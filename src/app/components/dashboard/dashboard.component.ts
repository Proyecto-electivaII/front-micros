import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    productos: 0,
    clientes: 0,
    facturas: 0,
    ventasTotales: 0.00
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Por ahora, estadísticas simuladas (sin conexión a microservicios)
    this.loadStats();
  }

  loadStats() {
    // Simular carga de estadísticas
    setTimeout(() => {
      this.stats = {
        productos: 0,  // Se actualizará cuando conectemos con el microservicio
        clientes: 0,   // Se actualizará cuando conectemos con el microservicio
        facturas: 0,   // Se actualizará cuando conectemos con el microservicio
        ventasTotales: 0.00  // Se calculará basado en las facturas
      };
    }, 500);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
