# ⚫⚪ Black & White Theme - Quick Reference

## 🎨 Color Palette

### Backgrounds
```css
--bg-primary: #000000      /* Pure black - main background */
--bg-secondary: #0a0a0a    /* Almost black - sections */
--bg-tertiary: #141414     /* Dark gray - panels */
--bg-card: #1a1a1a         /* Card backgrounds */
--bg-hover: #242424        /* Hover states */
```

### Text
```css
--text-primary: #ffffff    /* Pure white - headings */
--text-secondary: #e0e0e0  /* Light gray - body text */
--text-muted: #b0b0b0      /* Medium gray - metadata */
--text-dim: #808080        /* Dark gray - timestamps */
```

### Borders
```css
--border-primary: #333333  /* Dark gray - main borders */
--border-secondary: #404040 /* Medium gray - dividers */
--border-accent: #ffffff   /* White - active/focus */
```

## 🎯 CSS Classes Quick Reference

### Cards
```jsx
<div className="card-hover">
  {/* Black card with white border on hover */}
</div>
```

### Buttons
```jsx
<button className="btn-primary">
  {/* White background, black text */}
</button>

<button className="btn-secondary">
  {/* Transparent, white text, gray border */}
</button>
```

### Badges
```jsx
<span className="badge">
  {/* White background, black text */}
</span>

<span className="badge-outline">
  {/* Transparent, white text, border */}
</span>

<span className="ai-badge">
  {/* Special AI feature badge */}
</span>
```

### Inputs
```jsx
<input className="input-field" />
{/* Dark background, white text, white border on focus */}
```

### Text Styles
```jsx
<h1 className="section-title">Title</h1>
{/* White left border, bold */}

<p className="metadata">Info</p>
{/* Gray text with dot bullet */}
```

### Dividers
```jsx
<div className="divider" />
{/* Gradient horizontal line */}

<div className="divider-solid" />
{/* Solid gray line */}
```

### AI-Specific
```jsx
<div className="ai-chat-bubble user">
  {/* User message bubble */}
</div>

<div className="ai-chat-bubble assistant">
  {/* AI response bubble */}
</div>

<div className="ai-feature-card">
  {/* AI feature showcase card */}
</div>
```

## 📐 Layout Examples

### Page Structure
```jsx
<div style={{ background: '#000000', minHeight: '100vh' }}>
  <nav style={{ background: '#0a0a0a', borderBottom: '1px solid #333' }}>
    {/* Navigation */}
  </nav>
  
  <main style={{ padding: '2rem' }}>
    <h1 className="section-title">Page Title</h1>
    <div className="divider" />
    
    {/* Content */}
  </main>
</div>
```

### Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {items.map(item => (
    <div className="card-hover p-6 rounded-lg">
      <h3 style={{ color: '#ffffff' }}>{item.title}</h3>
      <p className="metadata">{item.author}</p>
      <span className="badge">{item.category}</span>
    </div>
  ))}
</div>
```

### AI Chat Interface
```jsx
<div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem' }}>
  <h2 className="section-title">AI Research Assistant</h2>
  
  <div className="space-y-4">
    <div className="ai-chat-bubble user">
      <p>What is machine learning?</p>
    </div>
    
    <div className="ai-chat-bubble assistant">
      <p>Machine learning is...</p>
    </div>
  </div>
  
  <div className="mt-4 flex gap-2">
    <input className="input-field flex-1" placeholder="Ask anything..." />
    <button className="btn-primary">Send</button>
  </div>
</div>
```

## 🎭 Component Patterns

### Search Bar
```jsx
<div className="max-w-4xl mx-auto">
  <input 
    className="input-field w-full text-lg"
    style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      borderColor: '#333333'
    }}
    placeholder="Search documents..."
    onFocus={(e) => e.target.style.borderColor = '#ffffff'}
    onBlur={(e) => e.target.style.borderColor = '#333333'}
  />
</div>
```

### Feature Card
```jsx
<div className="ai-feature-card">
  <div className="flex items-center gap-2 mb-4">
    <span className="ai-badge">AI-Powered</span>
    <h3 style={{ color: '#ffffff' }}>Semantic Search</h3>
  </div>
  <p className="metadata">
    Search by meaning, not just keywords
  </p>
  <button className="btn-secondary mt-4">Try Now</button>
</div>
```

### Stats Display
```jsx
<div className="grid grid-cols-3 gap-4">
  <div className="card-hover p-6 text-center">
    <p className="text-4xl font-bold" style={{ color: '#ffffff' }}>
      1,234
    </p>
    <p className="metadata">Documents</p>
  </div>
  {/* More stats */}
</div>
```

## 🔧 Inline Styles Reference

### Common Patterns
```jsx
// Black background
style={{ background: '#000000' }}

// Dark card
style={{ background: '#1a1a1a', border: '2px solid #333333' }}

// White text
style={{ color: '#ffffff' }}

// Gray text
style={{ color: '#b0b0b0' }}

// White border
style={{ borderColor: '#ffffff' }}

// Gray border
style={{ borderColor: '#333333' }}
```

## ✨ Animation Classes

```jsx
className="animate-fade-in"        // Fade in from top
className="animate-slide-up"       // Slide up from bottom
className="animate-scale-in"       // Scale from 95% to 100%
className="animate-slide-in-right" // Slide from right
className="animate-slide-in-left"  // Slide from left
className="animate-float"          // Floating animation
className="animate-pulse-border"   // Pulsing border
```

### Stagger Delays
```jsx
className="animate-slide-up stagger-1" // 0.1s delay
className="animate-slide-up stagger-2" // 0.2s delay
className="animate-slide-up stagger-3" // 0.3s delay
// ... up to stagger-6
```

## 📱 Responsive Utilities

```jsx
// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Responsive padding
className="px-4 sm:px-6 lg:px-8"

// Responsive text
className="text-2xl md:text-4xl lg:text-6xl"
```

## 🎨 Complete Page Example

```jsx
function AIFeaturesPage() {
  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: '#0a0a0a', borderBottom: '1px solid #333' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold" style={{ color: '#ffffff' }}>
            IntelliLib AI Features
          </h1>
          <p className="metadata mt-2">
            Powered by Advanced Machine Learning
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="section-title text-3xl mb-8">Core AI Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="ai-feature-card animate-fade-in stagger-1">
              <span className="ai-badge mb-4">AI-Powered</span>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>
                Semantic Search
              </h3>
              <p className="metadata mb-4">
                Search by meaning, not just keywords
              </p>
              <button className="btn-secondary w-full">Learn More</button>
            </div>

            {/* Feature 2 */}
            <div className="ai-feature-card animate-fade-in stagger-2">
              <span className="ai-badge mb-4">AI-Powered</span>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>
                Research Assistant
              </h3>
              <p className="metadata mb-4">
                Get instant answers to academic questions
              </p>
              <button className="btn-secondary w-full">Try Now</button>
            </div>

            {/* Feature 3 */}
            <div className="ai-feature-card animate-fade-in stagger-3">
              <span className="ai-badge mb-4">AI-Powered</span>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>
                Smart Summaries
              </h3>
              <p className="metadata mb-4">
                AI-generated document summaries
              </p>
              <button className="btn-secondary w-full">Explore</button>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* AI Chat Demo */}
        <section>
          <h2 className="section-title text-3xl mb-8">Try AI Assistant</h2>
          
          <div className="card-hover p-8 rounded-xl">
            <div className="space-y-4 mb-6">
              <div className="ai-chat-bubble user">
                <p style={{ color: '#ffffff' }}>
                  What is semantic search?
                </p>
                <span className="metadata">You • Just now</span>
              </div>
              
              <div className="ai-chat-bubble assistant">
                <p style={{ color: '#ffffff' }}>
                  Semantic search understands the intent and contextual meaning...
                </p>
                <span className="metadata">AI Assistant • Just now</span>
              </div>
            </div>

            <div className="flex gap-3">
              <input 
                className="input-field flex-1"
                placeholder="Ask me anything about research..."
              />
              <button className="btn-primary">Send</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
```

---

## 🚀 Quick Start Checklist

- [ ] Import CSS file with black/white theme
- [ ] Use `card-hover` for all cards
- [ ] Use `btn-primary` or `btn-secondary` for buttons
- [ ] Use `input-field` for all inputs
- [ ] Use `section-title` for section headings
- [ ] Use `metadata` for secondary information
- [ ] Use `badge` or `ai-badge` for tags
- [ ] Add `animate-*` classes for animations
- [ ] Use CSS variables for colors
- [ ] Test contrast ratios

---

**Theme**: Black & White High Contrast  
**Visibility**: Maximum  
**Accessibility**: WCAG AAA Compliant  
**Style**: Clean, Professional, Academic
