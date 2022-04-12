import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { OpModalLocalsMap } from 'core-app/shared/components/modal/modal.types';
import { OpModalComponent } from 'core-app/shared/components/modal/modal.component';
import { OpModalLocalsToken } from 'core-app/shared/components/modal/modal.service';
import { ApiV3Service } from 'core-app/core/apiv3/api-v3.service';
import { PrincipalData } from 'core-app/shared/components/principal/principal-types';
import { RoleResource } from 'core-app/features/hal/resources/role-resource';
import { HalResource } from 'core-app/features/hal/resources/hal-resource';
import { CategoryResource } from 'core-app/features/hal/resources/category-resource';

@Component({
  templateUrl: './task-template.component.html',
  styleUrls: ['./task-template.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTemplateComponent extends OpModalComponent implements OnInit {
  /* Close on outside click */
  public closeOnOutsideClick = true;

  /* Data that is returned from the modal on close */
  public data:any = null;

  public category:CategoryResource|null = null;

  public role:RoleResource|null = null;

  public message = '';

  public get loading() {
    return this.locals.categoryId && !this.category;
  }

  constructor(
    @Inject(OpModalLocalsToken) public locals:OpModalLocalsMap,
    readonly cdRef:ChangeDetectorRef,
    readonly elementRef:ElementRef,
    readonly apiV3Service:ApiV3Service,
  ) {
    super(locals, cdRef, elementRef);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.locals.categoryId) {
      this.category = this.locals.categoryId;
      // WHY IT RETURNS ProjectResource sometimes??
      /*
      this.apiV3Service.categories.id(this.locals.categoryId).get().subscribe(
        (data) => {
          console.log(data);
          this.data = data.name;
          this.category = data;
          this.cdRef.markForCheck();
        },
        () => {
          // this shouldn't happen
          this.locals.categoryId = null;
          this.cdRef.markForCheck();
        },
      );
      */
    }
  }

  onSaveCategory($event:any) {
    this.data = $event;
    this.closeMe();
  }
}
