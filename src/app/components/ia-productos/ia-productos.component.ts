import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService, ChatMessage } from '../../services/ia.service';

@Component({
  selector: 'app-ia-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ia-productos.component.html',
  styleUrl: './ia-productos.component.css'
})
export class IaProductosComponent implements OnInit, AfterViewInit {
  @ViewChild('logContainer') logContainer!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef;

  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  currentView: 'loading' | 'error' | 'products' | 'product-detail' | 'initial' | 'success' = 'initial';
  products: any[] = [];
  selectedProduct: any = null;
  errorMessage: string = '';

  constructor(private iaService: IaService) {}

  ngOnInit() {
    this.startConversation();
  }

  ngAfterViewInit() {
    // Focus en el input después de que se renderice
    setTimeout(() => {
      if (this.chatInput) {
        this.chatInput.nativeElement.focus();
      }
    }, 100);
  }

  startConversation() {
    this.addAgentMessage("Hola, soy tu asistente de productos. ¿Qué te gustaría ver hoy?");
  }

  addAgentMessage(text: string) {
    const message: ChatMessage = {
      text,
      isUser: false,
      timestamp: new Date()
    };
    this.messages.push(message);
    this.scrollToBottom();
  }

  addUserMessage(text: string) {
    const message: ChatMessage = {
      text,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(message);
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.logContainer) {
        const container = this.logContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  onInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage() {
    const input = this.userInput.trim();
    if (input) {
      this.addUserMessage(input);
      this.processQuery(input);
      this.userInput = '';
    }
  }

  async processQuery(consulta: string) {
    this.isLoading = true;
    this.currentView = 'loading';
    
    try {
      const response = await this.iaService.preguntar(consulta).toPromise();
      console.log('Respuesta completa del agente:', response);
      
      if (response == null) {
        this.showError("Recibí una respuesta inesperada del agente.");
      } else if (response.error) {
        this.showError(response.error);
      } else {
        // Verificar si es una respuesta de creación exitosa
        if (response.id && response.nombre && response.precio !== undefined) {
          this.renderCreationSuccess(response);
        }
        // Decidimos cómo renderizar basado en el tipo de dato recibido
        else if (Array.isArray(response)) {
          this.renderProductGrid(response);
        } else if (typeof response === 'object' && response !== null) {
          // Si tiene mensaje de éxito, es una operación completada
          if (response.mensaje) {
            this.renderOperationSuccess(response);
          } else {
            this.renderProductDetailView(response);
          }
        } else {
          this.showError("Recibí una respuesta inesperada del agente.");
        }
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      this.showError('No se pudo conectar con el agente. Revisa la consola.');
    } finally {
      this.isLoading = false;
    }
  }

  renderProductGrid(products: any[]) {
    if (!products || products.length === 0) {
      this.showError("No encontré productos que coincidan con tu búsqueda.");
      return;
    }
    this.products = products;
    this.currentView = 'products';
  }

  renderProductDetailView(product: any) {
    if (!product) {
      this.showError('El producto solicitado no fue encontrado.');
      return;
    }
    this.selectedProduct = product;
    this.currentView = 'product-detail';
  }

  renderCreationSuccess(product: any) {
    this.selectedProduct = {
      ...product,
      mensaje: `¡Producto "${product.nombre}" creado exitosamente!`
    };
    this.currentView = 'product-detail';
    this.addAgentMessage(`¡Excelente! He creado el producto "${product.nombre}" con precio ${this.formatPrice(product.precio)}.`);
  }

  renderOperationSuccess(result: any) {
    this.selectedProduct = result;
    this.currentView = 'product-detail';
    if (result.mensaje) {
      this.addAgentMessage(result.mensaje);
    }
  }

  showError(message: string) {
    this.errorMessage = message;
    this.currentView = 'error';
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CO', { 
      style: 'currency', 
      currency: 'COP' 
    });
  }
}
