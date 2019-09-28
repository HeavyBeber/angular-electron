import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewClientDialogData } from '../core/models/new-client-dialog-data';


@Component({
  selector: 'app-create-new-client-dialog',
  templateUrl: './create-new-client-dialog.component.html',
  styleUrls: ['./create-new-client-dialog.component.scss']
})
export class CreateNewClientDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CreateNewClientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewClientDialogData) { }

  ngOnInit() {
    this.data.okPressed = false;
  }

  onNoClick(): void {
    this.dialogRef.close(this.data);
  }

  saveCust(): void {
    if (this.isValid(this.data)) {
      this.data.okPressed = true;
      this.data.lastName = this.data.lastName.toUpperCase();
      this.dialogRef.close(this.data);
    }
  }

  isValid(data: NewClientDialogData) {
    return data.firstName && data.lastName && data.puppy && data.birthdate && data.race;
  }
}
