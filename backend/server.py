from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'forgeit-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7

CLUBS = ['Rotaract', 'Entrepreneurship', 'Tech', 'Social', 'Cultural']

class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdateInput(BaseModel):
    name: Optional[str] = None
    clubs: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    needs: Optional[List[str]] = None
    offers: Optional[List[str]] = None
    bio: Optional[str] = None

class ConnectionRequestInput(BaseModel):
    target_user_id: str

class MessageSendInput(BaseModel):
    to_user_id: str
    content: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    clubs: List[str] = []
    skills: List[str] = []
    needs: List[str] = []
    offers: List[str] = []
    bio: Optional[str] = None
    verified: bool = False
    profile_completed: bool = False
    created_at: datetime

class Connection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    connection_id: str
    user_id_1: str
    user_id_2: str
    status: str
    created_at: datetime

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str
    from_user_id: str
    to_user_id: str
    content: str
    read: bool = False
    created_at: datetime

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> str:
    session_token = request.cookies.get('session_token')
    auth_header = request.headers.get('Authorization')
    
    token = None
    if session_token:
        token = session_token
    elif auth_header and auth_header.startswith('Bearer '):
        token = auth_header.replace('Bearer ', '')
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session_doc:
        expires_at = session_doc["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        return session_doc["user_id"]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register")
async def register(input: RegisterInput):
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pwd = hash_password(input.password)
    
    user_doc = {
        "user_id": user_id,
        "email": input.email,
        "password": hashed_pwd,
        "name": input.name,
        "picture": None,
        "clubs": [],
        "skills": [],
        "needs": [],
        "offers": [],
        "bio": None,
        "verified": False,
        "profile_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    token = create_jwt_token(user_id)
    
    user_doc.pop('password')
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return {"user": User(**user_doc), "token": token}

@api_router.post("/auth/login")
async def login(input: LoginInput):
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc or not verify_password(input.password, user_doc.get('password', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user_doc['user_id'])
    
    user_doc.pop('password', None)
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return {"user": User(**user_doc), "token": token}

@api_router.get("/auth/google-session")
async def google_session(request: Request, response: Response):
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
                headers={'X-Session-ID': session_id}
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch Google session: {str(e)}")
    
    email = data.get('email')
    name = data.get('name')
    picture = data.get('picture')
    session_token = data.get('session_token')
    
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc['user_id']
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "clubs": [],
            "skills": [],
            "needs": [],
            "offers": [],
            "bio": None,
            "verified": True,
            "profile_completed": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.get("/auth/me")
async def get_me(request: Request):
    user_id = await get_current_user(request)
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}

@api_router.get("/profile/me")
async def get_my_profile(request: Request):
    user_id = await get_current_user(request)
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.get("/profile/{target_user_id}")
async def get_user_profile(target_user_id: str, request: Request):
    await get_current_user(request)
    user_doc = await db.users.find_one({"user_id": target_user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.put("/profile/update")
async def update_profile(input: ProfileUpdateInput, request: Request):
    user_id = await get_current_user(request)
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if update_data:
        if 'clubs' in update_data or 'skills' in update_data:
            update_data['profile_completed'] = True
        
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.get("/discover")
async def discover_users(
    request: Request,
    club: Optional[str] = None,
    skill: Optional[str] = None,
    need: Optional[str] = None,
    search: Optional[str] = None
):
    user_id = await get_current_user(request)
    
    query = {"user_id": {"$ne": user_id}}
    
    if club:
        query["clubs"] = club
    if skill:
        query["skills"] = {"$regex": skill, "$options": "i"}
    if need:
        query["needs"] = {"$regex": need, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"skills": {"$regex": search, "$options": "i"}},
            {"bio": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.users.find(query, {"_id": 0, "password": 0}).to_list(100)
    
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return [User(**u) for u in users]

@api_router.post("/connections/request")
async def request_connection(input: ConnectionRequestInput, request: Request):
    user_id = await get_current_user(request)
    
    if user_id == input.target_user_id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")
    
    existing = await db.connections.find_one({
        "$or": [
            {"user_id_1": user_id, "user_id_2": input.target_user_id},
            {"user_id_1": input.target_user_id, "user_id_2": user_id}
        ]
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Connection already exists")
    
    connection_id = f"conn_{uuid.uuid4().hex[:12]}"
    connection_doc = {
        "connection_id": connection_id,
        "user_id_1": user_id,
        "user_id_2": input.target_user_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.connections.insert_one(connection_doc)
    
    if isinstance(connection_doc['created_at'], str):
        connection_doc['created_at'] = datetime.fromisoformat(connection_doc['created_at'])
    
    return Connection(**connection_doc)

@api_router.post("/connections/accept/{connection_id}")
async def accept_connection(connection_id: str, request: Request):
    user_id = await get_current_user(request)
    
    connection = await db.connections.find_one(
        {"connection_id": connection_id, "user_id_2": user_id, "status": "pending"},
        {"_id": 0}
    )
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection request not found")
    
    await db.connections.update_one(
        {"connection_id": connection_id},
        {"$set": {"status": "accepted"}}
    )
    
    connection['status'] = 'accepted'
    if isinstance(connection['created_at'], str):
        connection['created_at'] = datetime.fromisoformat(connection['created_at'])
    
    return Connection(**connection)

@api_router.delete("/connections/reject/{connection_id}")
async def reject_connection(connection_id: str, request: Request):
    user_id = await get_current_user(request)
    
    result = await db.connections.delete_one({
        "connection_id": connection_id,
        "user_id_2": user_id,
        "status": "pending"
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Connection request not found")
    
    return {"message": "Connection rejected"}

@api_router.get("/connections")
async def get_connections(request: Request, status: Optional[str] = None):
    user_id = await get_current_user(request)
    
    query = {
        "$or": [
            {"user_id_1": user_id},
            {"user_id_2": user_id}
        ]
    }
    
    if status:
        query["status"] = status
    
    connections = await db.connections.find(query, {"_id": 0}).to_list(1000)
    
    result = []
    for conn in connections:
        if isinstance(conn['created_at'], str):
            conn['created_at'] = datetime.fromisoformat(conn['created_at'])
        
        other_user_id = conn['user_id_2'] if conn['user_id_1'] == user_id else conn['user_id_1']
        user_doc = await db.users.find_one({"user_id": other_user_id}, {"_id": 0, "password": 0})
        
        if user_doc:
            if isinstance(user_doc['created_at'], str):
                user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
            result.append({
                "connection": Connection(**conn),
                "user": User(**user_doc)
            })
    
    return result

@api_router.get("/messages/conversations")
async def get_conversations(request: Request):
    user_id = await get_current_user(request)
    
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"from_user_id": user_id},
                    {"to_user_id": user_id}
                ]
            }
        },
        {"$sort": {"created_at": -1}},
        {
            "$group": {
                "_id": {
                    "$cond": [
                        {"$eq": ["$from_user_id", user_id]},
                        "$to_user_id",
                        "$from_user_id"
                    ]
                },
                "lastMessage": {"$first": "$$ROOT"}
            }
        }
    ]
    
    conversations = await db.messages.aggregate(pipeline).to_list(100)
    
    result = []
    for conv in conversations:
        other_user_id = conv['_id']
        user_doc = await db.users.find_one({"user_id": other_user_id}, {"_id": 0, "password": 0})
        
        if user_doc:
            if isinstance(user_doc['created_at'], str):
                user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
            
            last_msg = conv['lastMessage']
            if isinstance(last_msg.get('created_at'), str):
                last_msg['created_at'] = datetime.fromisoformat(last_msg['created_at'])
            
            result.append({
                "user": User(**user_doc),
                "lastMessage": last_msg
            })
    
    return result

@api_router.get("/messages/{other_user_id}")
async def get_messages(other_user_id: str, request: Request):
    user_id = await get_current_user(request)
    
    messages = await db.messages.find({
        "$or": [
            {"from_user_id": user_id, "to_user_id": other_user_id},
            {"from_user_id": other_user_id, "to_user_id": user_id}
        ]
    }, {"_id": 0}).sort("created_at", 1).to_list(1000)
    
    await db.messages.update_many(
        {"from_user_id": other_user_id, "to_user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    for msg in messages:
        if isinstance(msg['created_at'], str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return [Message(**m) for m in messages]

@api_router.post("/messages/send")
async def send_message(input: MessageSendInput, request: Request):
    user_id = await get_current_user(request)
    
    connection = await db.connections.find_one({
        "$or": [
            {"user_id_1": user_id, "user_id_2": input.to_user_id},
            {"user_id_1": input.to_user_id, "user_id_2": user_id}
        ],
        "status": "accepted"
    }, {"_id": 0})
    
    if not connection:
        raise HTTPException(status_code=403, detail="Can only message connected users")
    
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "from_user_id": user_id,
        "to_user_id": input.to_user_id,
        "content": input.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    
    if isinstance(message_doc['created_at'], str):
        message_doc['created_at'] = datetime.fromisoformat(message_doc['created_at'])
    
    return Message(**message_doc)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
