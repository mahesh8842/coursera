import { Component, OnInit,Input , ViewChild } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-dish-detail',
  templateUrl: './dish-detail.component.html',
  styleUrls: ['./dish-detail.component.scss']
})
export class DishDetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm : FormGroup;
  comment : Comment ;
  @ViewChild('fform') commentFormDirective;

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb:FormBuilder) { this.createForm(); }

    ngOnInit() {
      this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
    }

    setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm()
  {
    this.commentForm = this.fb.group({
      rating : [ 5 ,Validators.required ],
      comment : [ '',Validators.required ],
      author : [ '', [Validators.required, Validators.minLength(2) ]]

    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

      this.onValueChanged();

    }

    onValueChanged(data?: any) {
      if (!this.commentForm) { return; }
      const form = this.commentForm;
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          // clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      }
    }

    formErrors = {
    'rating': '',
    'comment': '',
    'author': ''
  };


    validationMessages = {
      'comment' : {
          'required' : ''
      },
      'author' : {
          'required': 'Must enter author name ',
          'minlength' : 'author name should be min 2 characters'
      }
    };

    onSubmit() {
      this.comment = this.commentForm.value;
      console.log(this.comment);
      this.dishService.getDish(this.dish.id).subscribe(dish =>{ this.dish = dish,this.comment.date =new Date().toString(),this.dish.comments.push(this.comment)});
      this.commentForm.reset();
      this.commentFormDirective.resetForm({rating:5});

    }
}