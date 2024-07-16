from fastapi import APIRouter

router = APIRouter()


@router.get('/', description="Test endpoint")
async def test_endpoint():
    return {"message": "Hello, world!"}
