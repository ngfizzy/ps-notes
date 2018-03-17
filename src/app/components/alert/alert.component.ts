import { Component } from '@angular/core';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {

  isOpen = false;
  message = '';
  dismissText = '';
  afterClose = () => false;

  constructor(private alertService: AlertService) {
    this.alertService.registerAlertComponent(this);
  }

  /**
   * It shows the alert component
   *
   * @param message message displayed in the alert
   * @param dismissText message
   *
   * @returns {void}
   */
  open(message: string, dismissText: string): void {
    this.isOpen = true,
    this.message = message;
    this.dismissText = dismissText;
    this.afterClose();
  }

  /**
   * Closes the alert
   *
   * @param event event from the DOM
   *
   * @returns {void}
   */
  close(event) {
    if (event.target.className !== 'alert') {
      this.isOpen = false;
      this.afterClose();
    }
  }
}
