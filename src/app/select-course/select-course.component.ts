import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectCourse } from '../core/models/select-course';

@Component({
  selector: 'app-select-course',
  templateUrl: './select-course.component.html',
  styleUrls: ['./select-course.component.scss']
})
export class SelectCourseComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<SelectCourseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectCourse) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.data.chosenId = -1;
    this.dialogRef.close(this.data);
  }

  choseCourse(course) {
    console.log(course);
    this.data.chosenId = course;
    this.dialogRef.close(this.data);
  }
}
