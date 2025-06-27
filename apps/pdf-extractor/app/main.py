import pdfplumber
import pandas as pd
import json
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from typing import Optional
import uuid
import os
import aiofiles
from starlette.background import BackgroundTask
import logging
from concurrent.futures import ProcessPoolExecutor
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PDF Extraction Microservice")

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

max_workers = os.cpu_count() or 1
executor = ProcessPoolExecutor(max_workers=max_workers)


def sync_extract_text(pdf_path: str):
    """Synchronous PDF extraction function to run in process pool"""
    structured_data = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                tables = page.extract_tables()
                structured_data.append(
                    {
                        "page": i + 1,
                        "text": text.strip() if text else "",
                        "tables": (
                            [
                                pd.DataFrame(table).to_dict(orient="records")
                                for table in tables
                            ]
                            if tables
                            else []
                        ),
                    }
                )
        return structured_data
    except Exception as e:
        logger.error(f"Error processing {pdf_path}: {str(e)}")
        raise


def sync_save_output(data, output_path: str, output_format: str):
    """Synchronous output saving function"""
    try:
        if output_format == "json":
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        elif output_format == "csv":
            rows = []
            for page in data:
                for table in page["tables"]:
                    rows.extend(table)
            df = pd.DataFrame(rows)
            df.to_csv(output_path, index=False)
        elif output_format == "txt":
            with open(output_path, "w", encoding="utf-8") as f:
                for page in data:
                    f.write(f"--- Page {page['page']} ---\n")
                    f.write(page["text"] + "\n\n")
        else:
            raise ValueError("Unsupported output format.")
        return True
    except Exception as e:
        logger.error(f"Error saving output {output_path}: {str(e)}")
        raise


async def process_pdf(file_path: str, output_format: str, job_id: str):
    """Async wrapper for PDF processing"""
    try:
        loop = asyncio.get_running_loop()
        extracted_data = await loop.run_in_executor(
            executor, sync_extract_text, file_path
        )

        output_filename = f"{job_id}.{output_format}"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        await loop.run_in_executor(
            executor,
            sync_save_output,
            extracted_data,
            output_path,
            output_format,
        )

        return output_path
    except Exception as e:
        logger.error(f"Error in job {job_id}: {str(e)}")
        raise


async def cleanup_files(*files):
    """Clean up temporary files"""
    for file in files:
        try:
            if file and os.path.exists(file):
                os.unlink(file)
        except Exception as e:
            logger.warning(f"Could not delete file {file}: {str(e)}")


@app.post("/extract")
async def extract_from_pdf(
    file: UploadFile,
    output_format: Optional[str] = "json",
    callback_url: Optional[str] = None,
):
    """Endpoint for PDF extraction"""
    if output_format is None:
        output_format = "json"

    if file.filename is None:
        file.filename = "file.pdf"

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, detail="Only PDF files are supported")

    job_id = str(uuid.uuid4())
    upload_path = os.path.join(UPLOAD_DIR, f"{job_id}.pdf")

    try:
        async with aiofiles.open(upload_path, "wb") as f:
            await f.write(await file.read())

        output_path = await process_pdf(upload_path, output_format, job_id)

        if callback_url:
            logger.info(f"Would callback to {callback_url} for job {job_id}")

        media_type = "application/octet-stream"
        if output_format == "json":
            media_type = "application/json"
        elif output_format == "csv":
            media_type = "text/csv"
        elif output_format == "txt":
            media_type = "text/plain"
        else:
            media_type = "application/octet-stream"

        return FileResponse(
            output_path,
            media_type=media_type,
            background=BackgroundTask(
                cleanup_files,
                upload_path,
                output_path,
            ),
        )
    except Exception as e:
        await cleanup_files(upload_path)
        raise HTTPException(500, detail=str(e))


@app.get("/status")
async def service_status():
    """Health check endpoint"""
    return {"status": "healthy", "workers": max_workers}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9000)
