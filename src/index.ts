import { RefObject } from 'react';

export type PrintType = 'a4' | 'thermal';

export interface PrintResult {
  success: boolean;
  error?: string;
  message: string;
}

export interface PrintOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  timeout?: number;
}

export interface UsePrintReturn {
  handlePrint: (
    contentRef: RefObject<HTMLElement> | HTMLElement | null, 
    type?: PrintType, 
    options?: PrintOptions
  ) => Promise<PrintResult>;
}

/**
 * Custom React hook for native browser printing with support for A4 and thermal receipt formats
 * 
 * @returns Object containing the handlePrint function
 * 
 * @example
 * ```tsx
 * import { usePrint } from 'use-native-print';
 * import { useRef } from 'react';
 * 
 * function MyComponent() {
 *   const { handlePrint } = usePrint();
 *   const printRef = useRef<HTMLDivElement>(null);
 * 
 *   const print = async () => {
 *     const result = await handlePrint(printRef, 'a4', {
 *       onSuccess: (msg) => console.log(msg),
 *       onError: (err) => console.error(err)
 *     });
 *     
 *     if (result.success) {
 *       alert('Printed successfully!');
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <div ref={printRef}>
 *         <h1>Content to print</h1>
 *         <p>This content will be printed</p>
 *       </div>
 *       <button onClick={print}>Print A4</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const usePrint = (): UsePrintReturn => {
  /**
   * Handles the printing process by creating an iframe with the content
   * 
   * @param contentRef - React ref pointing to the element to be printed
   * @param type - Print format type ('a4' or 'thermal'), defaults to 'a4'
   * @param options - Configuration options for callbacks and behavior
   * @returns Promise with print result
   */
  const handlePrint = async (
    contentRef: RefObject<HTMLElement> | HTMLElement | null,
    type: PrintType = 'a4',
    options: PrintOptions = {}
  ): Promise<PrintResult> => {
    const { onSuccess, onError, onStart, timeout = 5000 } = options;

    const element = contentRef && (
      (contentRef as RefObject<HTMLElement>).current || 
      (contentRef as HTMLElement)
    );

    // Validate content reference
    if (!element) {
      const errorMsg = 'Elemento para impressão não encontrado!';
      console.error('[kima-print]', errorMsg);
      onError?.(errorMsg);
      return { success: false, error: errorMsg, message: errorMsg };
    }

    try {
      // Notify start of printing process
      onStart?.();
      console.log('[usePrint] Iniciando processo de impressão...');

      return new Promise<PrintResult>((resolve) => {
        // Create invisible iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
          position: fixed;
          right: 0;
          bottom: 0;
          width: 0;
          height: 0;
          border: 0;
          visibility: hidden;
        `;
        document.body.appendChild(iframe);

        // Clone the content to avoid modifying the original
        const contentClone = element!.cloneNode(true) as HTMLElement;

        // Define print styles based on type
        let printStyles = '';
        
        if (type === 'a4') {
          printStyles = `
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 10px;
                }
                body {
                  margin: 0 !important;
                  width: 210mm;
                  min-height: 297mm;
                  font-size: 12pt;
                  -webkit-print-color-adjust: exact;
                }
              }
              @page { margin: 0 20px; }
              body { margin: 0; }
              .thermal-table {
                width: 100%;
                border-collapse: collapse;
              }
            </style>
          `;
        } else {
          printStyles = `
            <style>
              @media print {
                @page {
                  size: 80mm auto;
                  margin: 10px;
                  margin-top: 5mm;
                }
                body {
                  margin: 0 !important;
                  width: 80mm !important;
                  max-width: 80mm !important;
                  font-size: 10pt;
                  -webkit-print-color-adjust: exact;
                }
                * {
                  box-sizing: border-box;
                }
                .thermal-content {
                  padding: 2mm;
                  white-space: pre-wrap;
                }
                table {
                  width: 100% !important;
                  table-layout: fixed;
                }
                td, th {
                  padding: 2px !important;
                  word-break: break-word;
                }
                .no-print {
                  display: none !important;
                }
                .break-before {
                  page-break-before: always;
                }
                .break-after {
                  page-break-after: always;
                }
              }
            </style>
          `;
        }

        // Cleanup function
        const cleanup = () => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        };

        // Timeout handler
        const timeoutId = setTimeout(() => {
          cleanup();
          const timeoutMsg = `Timeout: Impressão não foi concluída em ${timeout}ms`;
          console.warn('[usePrint]', timeoutMsg);
          onError?.(timeoutMsg);
          resolve({ 
            success: false, 
            error: timeoutMsg, 
            message: timeoutMsg 
          });
        }, timeout);

        // Write content to iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          clearTimeout(timeoutId);
          cleanup();
          const errorMsg = 'Não foi possível acessar o documento do iframe';
          console.error('[usePrint]', errorMsg);
          onError?.(errorMsg);
          resolve({ success: false, error: errorMsg, message: errorMsg });
          return;
        }

        iframeDoc.write(`
          <html>
            <head>
              ${printStyles}
              <title>Documento Impresso</title>
            </head>
            <body>
              ${contentClone.innerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();

        // Handle print and cleanup
        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) {
          clearTimeout(timeoutId);
          cleanup();
          const errorMsg = 'Não foi possível acessar a janela do iframe';
          console.error('[usePrint]', errorMsg);
          onError?.(errorMsg);
          resolve({ success: false, error: errorMsg, message: errorMsg });
          return;
        }

        // Setup print handlers
        iframeWindow.onload = () => {
          try {
            iframeWindow.focus();
            iframeWindow.print();
            
            // Success handling
            const successMsg = `Documento ${type.toUpperCase()} enviado para impressão com sucesso!`;
            console.log('[usePrint]', successMsg);
            onSuccess?.(successMsg);
            
            clearTimeout(timeoutId);
            setTimeout(cleanup, 1000);
            
            resolve({ 
              success: true, 
              message: successMsg 
            });
          } catch (printError) {
            clearTimeout(timeoutId);
            cleanup();
            const errorMsg = `Erro ao executar impressão: ${printError}`;
            console.error('[usePrint]', errorMsg);
            onError?.(errorMsg);
            resolve({ 
              success: false, 
              error: errorMsg, 
              message: errorMsg 
            });
          }
        };

        // Handle iframe load errors
        iframeWindow.onerror = (error) => {
          clearTimeout(timeoutId);
          cleanup();
          const errorMsg = `Erro no iframe: ${error}`;
          console.error('[usePrint]', errorMsg);
          onError?.(errorMsg);
          resolve({ 
            success: false, 
            error: errorMsg, 
            message: errorMsg 
          });
        };
      });

    } catch (error) {
      const errorMsg = `Erro inesperado: ${error}`;
      console.error('[usePrint]', errorMsg);
      onError?.(errorMsg);
      return { 
        success: false, 
        error: errorMsg, 
        message: errorMsg 
      };
    }
  };

  return { handlePrint };
};

