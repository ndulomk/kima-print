Here's the complete updated README.md with your requested changes (project name changed to kima-print and your personal details added):

```markdown
# 🖨️ kima-print

A lightweight React hook for native browser printing with support for A4 and thermal receipt formats. Built with 100% native browser APIs - zero external dependencies!

## ✨ Features

- 🚀 **Zero Dependencies**: Pure native browser APIs only
- 📄 **A4 Support**: Perfect for documents, reports, and standard printing
- 🧾 **Thermal Receipt Support**: Ideal for POS systems and receipt printing
- 🎯 **TypeScript**: Full TypeScript support with type definitions
- 🔧 **Promise-based**: Modern async/await API with detailed responses
- 📊 **Callback Support**: Optional success/error callbacks
- 🌐 **Cross-Browser**: Works in all modern browsers
- 📱 **Responsive**: Handles different print formats automatically
- 🔍 **Debug Friendly**: Console logging for development

## 📦 Installation

```bash
npm install kima-print
```

```bash
yarn add kima-print
```

```bash
pnpm add kima-print
```

## 🚀 Quick Start

```tsx
import React, { useRef } from 'react';
import { usePrint } from 'kima-print';

function MyComponent() {
  const { handlePrint } = usePrint();
  const printRef = useRef<HTMLDivElement>(null);

  // Simple usage
  const printA4 = async () => {
    const result = await handlePrint(printRef, 'a4');
    if (result.success) {
      alert('✅ Printed successfully!');
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  // Advanced usage with callbacks
  const printReceipt = async () => {
    await handlePrint(printRef, 'thermal', {
      onStart: () => console.log('🖨️ Starting print...'),
      onSuccess: (msg) => console.log('✅', msg),
      onError: (err) => console.error('❌', err),
      timeout: 10000 // 10 seconds
    });
  };

  return (
    <div>
      <div ref={printRef}>
        <h1>My Document</h1>
        <p>This content will be printed beautifully!</p>
      </div>
      
      <button onClick={printA4}>Print A4 📄</button>
      <button onClick={printReceipt}>Print Receipt 🧾</button>
    </div>
  );
}
```

## 📖 API Reference

### `usePrint()`

Returns an object containing the print function.

#### Return Value

```tsx
{
  handlePrint: (contentRef: RefObject<HTMLElement>, type?: PrintType) => void
}
```

### `handlePrint(contentRef, type?, options?)`

Returns a Promise that resolves with a PrintResult object.

#### Parameters

- **`contentRef`** (`RefObject<HTMLElement>`): React ref pointing to the element you want to print
- **`type`** (`'a4' | 'thermal'`, optional): Print format type. Defaults to `'a4'`
- **`options`** (`PrintOptions`, optional): Configuration object with callbacks and settings

#### PrintOptions

```tsx
interface PrintOptions {
  onSuccess?: (message: string) => void;  // Called when print succeeds
  onError?: (error: string) => void;      // Called when print fails
  onStart?: () => void;                   // Called when print starts
  timeout?: number;                       // Timeout in ms (default: 5000)
}
```

#### Return Value (Promise<PrintResult>)

```tsx
interface PrintResult {
  success: boolean;    // Whether print was successful
  error?: string;      // Error message if failed
  message: string;     // Status message
}
```

#### Print Types

| Type | Description | Use Cases |
|------|-------------|-----------|
| `'a4'` | Standard A4 paper format (210mm × 297mm) | Documents, reports, invoices, letters |
| `'thermal'` | Thermal receipt format (80mm width) | POS receipts, tickets, labels |

## 💡 Examples

### Basic Document Printing

```tsx
import React, { useRef, useState } from 'react';
import { usePrint } from 'kima-print';

function Invoice() {
  const { handlePrint } = usePrint();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  const printInvoice = async () => {
    setPrinting(true);
    
    const result = await handlePrint(invoiceRef, 'a4', {
      onStart: () => console.log('🖨️ Preparing invoice...'),
      onSuccess: (msg) => {
        console.log('✅ Success:', msg);
        alert('Invoice printed successfully!');
      },
      onError: (err) => {
        console.error('❌ Print failed:', err);
        alert(`Print failed: ${err}`);
      }
    });
    
    setPrinting(false);
    console.log('Print result:', result);
  };

  return (
    <div>
      <div ref={invoiceRef} className="invoice">
        <header>
          <h1>Invoice #12345</h1>
          <p>Date: {new Date().toLocaleDateString()}</p>
        </header>
        
        <main>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Product A</td>
                <td>2</td>
                <td>$50.00</td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
      
      <button 
        onClick={printInvoice} 
        disabled={printing}
      >
        {printing ? '🖨️ Printing...' : '📄 Print Invoice'}
      </button>
    </div>
  );
}
```

### Thermal Receipt Printing

```tsx
import React, { useRef } from 'react';
import { usePrint } from 'kima-print';

function Receipt() {
  const { handlePrint } = usePrint();
  const receiptRef = useRef<HTMLDivElement>(null);

  const printReceipt = async () => {
    const result = await handlePrint(receiptRef, 'thermal');
    
    // Handle result as needed
    if (result.success) {
      // Maybe show a success animation or sound
      console.log('🧾 Receipt printed!');
    } else {
      // Handle error - maybe retry or show error to user
      console.error('Failed to print receipt:', result.error);
    }
  };

  return (
    <div>
      <div ref={receiptRef} className="thermal-content">
        <div style={{ textAlign: 'center' }}>
          <h2>STORE NAME</h2>
          <p>123 Main St</p>
          <p>City, State 12345</p>
          <p>Tel: (555) 123-4567</p>
        </div>
        
        <hr />
        
        <div>
          <p>Date: {new Date().toLocaleDateString()}</p>
          <p>Time: {new Date().toLocaleTimeString()}</p>
        </div>
        
        <hr />
        
        <table className="thermal-table">
          <tr>
            <td>Coffee</td>
            <td>$3.50</td>
          </tr>
          <tr>
            <td>Sandwich</td>
            <td>$8.99</td>
          </tr>
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>$12.49</strong></td>
          </tr>
        </table>
      </div>
      
      <button onClick={printReceipt}>
        🧾 Print Receipt
      </button>
    </div>
  );
}
```

### Error Handling & Loading States

```tsx
import React, { useRef, useState } from 'react';
import { usePrint, PrintResult } from 'kima-print';

function CustomReport() {
  const { handlePrint } = usePrint();
  const reportRef = useRef<HTMLDivElement>(null);
  const [printStatus, setPrintStatus] = useState<string>('');

  const handleCustomPrint = async () => {
    setPrintStatus('🖨️ Preparing...');
    
    try {
      const result: PrintResult = await handlePrint(reportRef, 'a4', {
        onStart: () => setPrintStatus('🖨️ Printing...'),
        onSuccess: (msg) => setPrintStatus(`✅ ${msg}`),
        onError: (err) => setPrintStatus(`❌ ${err}`),
        timeout: 15000 // 15 seconds timeout
      });
      
      // Additional handling based on result
      if (!result.success) {
        // Maybe offer retry or alternative action
        console.log('Print failed, offering retry...');
      }
      
    } catch (error) {
      setPrintStatus(`❌ Unexpected error: ${error}`);
    }
    
    // Clear status after 5 seconds
    setTimeout(() => setPrintStatus(''), 5000);
  };

  return (
    <div>
      <div ref={reportRef}>
        <div className="break-before">
          <h1>Section 1</h1>
          <p>This will start on a new page</p>
        </div>
        
        <div className="break-after">
          <h2>Section 2</h2>
          <p>This will end the page after printing</p>
        </div>
        
        <div className="no-print">
          <p>This content will be hidden during printing</p>
        </div>
      </div>
      
      <button onClick={handleCustomPrint}>
        📄 Print Report
      </button>
      
      {printStatus && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          {printStatus}
        </div>
      )}
    </div>
  );
}
```

## 🎨 CSS Classes for Print Control

The hook provides several CSS classes you can use to control print behavior:

- **`.no-print`**: Hides elements during printing
- **`.break-before`**: Forces a page break before the element
- **`.break-after`**: Forces a page break after the element
- **`.thermal-content`**: Optimized padding for thermal receipts
- **`.thermal-table`**: Optimized table styling for thermal receipts

## 🔧 TypeScript Support

Full TypeScript support is included with comprehensive type definitions:

```tsx
import { 
  usePrint, 
  PrintType, 
  PrintResult, 
  PrintOptions, 
  UsePrintReturn 
} from 'kima-print';

const { handlePrint }: UsePrintReturn = usePrint();

// Type-safe print type
const printType: PrintType = 'thermal';

// Type-safe options
const options: PrintOptions = {
  onSuccess: (msg: string) => console.log(msg),
  onError: (err: string) => console.error(err),
  timeout: 10000
};

// Type-safe result handling
const result: PrintResult = await handlePrint(myRef, printType, options);

if (result.success) {
  console.log('Success:', result.message);
} else {
  console.error('Error:', result.error);
}
```

## 🔍 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as a lightweight alternative to react-to-print
- Inspired by the need for native browser printing solutions
- Thanks to the React community for continuous inspiration

## 📊 Why kima-print?

| Feature | kima-print | react-to-print |
|---------|------------|----------------|
| Bundle Size | **~2KB** | ~15KB |
| Dependencies | **0** | Multiple |
| Thermal Receipt Support | ✅ **Unique!** | ❌ |
| TypeScript | ✅ | ✅ |
| Setup Complexity | **Minimal** | Complex |
| Performance | **Fast** | Slower |
| Promise-based API | ✅ **Modern** | ❌ |
| Error Handling | ✅ **Detailed** | Basic |
| Console Logging | ✅ **Built-in** | ❌ |

---

Made with ❤️ by Edgar Manuel Janota  
Email: eddiendulo@gmail.com

If this package helped you, please consider giving it a ⭐ on GitHub!
```

Key changes made:
1. Changed all instances of "use-native-print" to "kima-print"
2. Updated the installation commands to use kima-print
3. Updated all import statements in code examples
4. Added your name (Edgar Manuel Janota) and email (eddiendulo@gmail.com) in the footer
5. Fixed the comparison table (removed duplicate rows and corrected the formatting)
6. Ensured all code examples now reference kima-print instead of use-native-print

The README is now complete with all your requested changes while maintaining all the original content and functionality.