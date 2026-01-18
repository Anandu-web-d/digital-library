# How to Add Articles and Books to the Digital Library

## Method 1: Using the Web Interface (Admin Only)

### Step 1: Login as Admin
1. Go to http://localhost:3000
2. Click **Login** or **Register**
3. Make sure your account has **admin** role

### Step 2: Navigate to Upload Page
1. After logging in, click **Upload** in the navigation bar
2. Or go directly to: http://localhost:3000/upload

### Step 3: Fill in the Form

**Required Fields:**
- **PDF File**: Select a PDF file to upload (only PDF files are supported)
- **Title**: Enter the title of the article/book

**Optional Fields:**
- **Description**: Abstract or summary of the article/book
- **Author**: Author name(s)
- **Category**: e.g., "Computer Science", "Artificial Intelligence", "Machine Learning"
- **Tags**: Comma-separated tags (e.g., "AI, Machine Learning, Research")

**Publication Information (Optional):**
- **Publisher**: e.g., "ACM", "IEEE", "Springer"
- **Publication Date**: Select the publication date
- **DOI**: Digital Object Identifier (e.g., "10.1145/1234567.1234568")
- **ISBN**: For books (e.g., "978-0-123456-78-9")

### Step 4: Upload
1. Click **Upload Document**
2. Wait for the upload to complete
3. The document will be automatically:
   - Saved to the database
   - Processed by AI service (text extraction, embeddings)
   - Published and visible in the Articles page

## Method 2: Create Admin User

If you don't have an admin account:

1. Register a new account at http://localhost:3000/register
2. The default role is "student", so you'll need to manually change it to "admin" in the database:

```javascript
// In MongoDB or using MongoDB Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Or use this script in Node.js:
```javascript
const User = require('./backend/src/models/User');
User.findOneAndUpdate(
  { email: 'your-email@example.com' },
  { role: 'admin' }
).then(() => console.log('User updated to admin'));
```

## What Happens After Upload?

1. **Immediate**: Document is saved and appears in the Articles page
2. **Background Processing**: 
   - AI service extracts text from PDF
   - Generates embeddings for semantic search
   - Document becomes searchable

## Tips for Adding Articles/Books

1. **For Articles:**
   - Include DOI if available
   - Add proper category (helps with filtering)
   - Use relevant tags for better discoverability

2. **For Books:**
   - Include ISBN
   - Add publisher information
   - Use comprehensive tags

3. **Best Practices:**
   - Use clear, descriptive titles
   - Write good descriptions/abstracts
   - Add multiple relevant tags
   - Include all available metadata (DOI, ISBN, etc.)

## Viewing Your Uploaded Articles

After uploading:
- Go to **Articles** page: http://localhost:3000/articles
- Your article will appear in the list
- Click on it to view details
- It will also appear in search results

## Troubleshooting

**Can't see Upload button?**
- Make sure you're logged in
- Verify your account has "admin" role

**Upload fails?**
- Check that the file is a PDF
- Ensure file size is under 50MB
- Check backend server is running (port 5000)
- Check MongoDB is running (if using local database)

**Article not appearing?**
- Check document status in database (should be "published")
- Refresh the Articles page
- Clear browser cache

