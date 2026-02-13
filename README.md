cd backend\python_files\rag

uvicorn main:app --host 0.0.0.0 --port 8000

curl "http://localhost:8000/search?q=roboty budowlane&limit=5" 
