import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './new-product.html',
  styleUrls: ['./new-product.css'],
})
export class NewProductComponent {
  product: any = { name: '', description: '', price: 0, initialStock: 0 };

  constructor(
    public dialogRef: MatDialogRef<NewProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onSubmit(): void {
    if (
      this.product.name &&
      this.product.description &&
      this.product.price >= 0 &&
      this.product.initialStock >= 0
    ) {
      this.dialogRef.close(this.product);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
