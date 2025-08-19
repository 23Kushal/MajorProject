# Major Project

## How to Run the Project

### 1. Start the XrayOperatorApp (Node.js Backend)


# Install dependencies (run inside XrayOperatorApp/backend)
npm install
# Start the development server
npm run dev


### 2. Start the ModelBackend (FastAPI)


# Install required Python packages (run inside ModelBackend)
py -m pip install fastapi uvicorn pillow
# Run the FastAPI server
py -m uvicorn main:app --reload

