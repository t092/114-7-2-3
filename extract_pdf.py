import pypdf
import sys

def extract_text_from_pdf(pdf_path, txt_path):
    with open(pdf_path, 'rb') as file:
        reader = pypdf.PdfReader(file)
        text = ''
        for i, page in enumerate(reader.pages):
            text += f"\n--- Page {i+1} ---\n\n"
            text += page.extract_text()
            
    with open(txt_path, 'w', encoding='utf-8') as file:
        file.write(text)

if __name__ == "__main__":
    extract_text_from_pdf('114-1-2-L03.pdf', '114-1-2-L03.txt')
    print("Extraction complete")
