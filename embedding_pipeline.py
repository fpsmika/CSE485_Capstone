import pandas as pd
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# 1. Load your Excel file
file_path = "Data Sample.xlsx"  
df = pd.read_excel(file_path)

# 2. Combine selected columns into a single text string
df['combined_text'] = (
    df['ItemDesc'].astype(str) + " | " +
    df['Vendor'].astype(str) + " | " +
    df['Manufacturer'].astype(str) + " | " +
    df['FacilityType'].astype(str) + " | " +
    df['Region'].astype(str) + " | " +
    "Qty:" + df['Quantity'].astype(str) + " | " +
    "Paid:$" + df['PricePaid'].astype(str) + " | " +
    "Spend:$" + df['TotalSpend'].astype(str) + " | " +
    "Date:" + df['Month'].astype(str) + "/" + df['Year'].astype(str)
)

# 3. Drop rows with missing values
texts = df['combined_text'].dropna().tolist()

# 4. Load Hugging Face embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')  

# 5. Generate embeddings with progress bar
print("\nGenerating embeddings...")
embeddings = [model.encode(text) for text in tqdm(texts, desc="Embedding Progress")]

# 6. Convert embeddings to DataFrame
embedding_df = pd.DataFrame(embeddings, columns=[f'embedding_{i}' for i in range(len(embeddings[0]))])

# 7. Save only embeddings to a new CSV file
output_file = "only_embeddings.csv"
embedding_df.to_csv(output_file, index=False)

print(f"\n Saved embeddings only to '{output_file}'")
