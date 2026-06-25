# AWS Xray Automation Backend

FastAPI backend for AWS Xray Automation system.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example` in the root directory

5. Run the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── models/              # Database models
├── services/            # Business logic layer
├── api/                 # API route handlers
└── tests/               # Test suite
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
