import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DbCustomer } from '../core/models/db-customer';
import { Moment } from 'moment';
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

  saveCust(): void{
    this.data.okPressed = true;
    this.dialogRef.close(this.data);
  }
}
