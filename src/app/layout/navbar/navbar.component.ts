import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../infrastructure/auth/auth.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  role: string = '';
  id: number | null = -1;
  constructor(private authService: AuthService, private router: Router) {
  }
  ngOnInit(): void {
    this.authService.userState.subscribe((result) => {
      this.role = result;
      this.id = this.authService.getId();
      console.log(this.role);
    })
  }

  logOut(): void {
    this.authService.logout().subscribe({
      next: (_) => {
        localStorage.removeItem('user');
        this.authService.setUser();
        this.router.navigate(['/login']);
      }
    })
  }


}
