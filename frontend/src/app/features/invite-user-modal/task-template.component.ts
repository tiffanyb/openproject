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

enum Steps {
  ProjectSelection,
  Principal,
  Role,
  Message,
  Summary,
  Success,
}

export enum PrincipalType {
  User = 'User',
  Placeholder = 'PlaceholderUser',
  Group = 'Group',
}

@Component({
  templateUrl: './task-template.component.html',
  styleUrls: ['./task-template.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTemplateComponent extends OpModalComponent implements OnInit {
  public Steps = Steps;

  public step = Steps.ProjectSelection;

  /* Close on outside click */
  public closeOnOutsideClick = true;

  /* Data that is returned from the modal on close */
  public data:any = null;

  public type:PrincipalType|null = null;

  public category:CategoryResource|null = null;

  public principalData:PrincipalData = {
    principal: null,
    customFields: {},
  };

  public role:RoleResource|null = null;

  public message = '';

  public createdNewPrincipal = false;

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
    }
  }

  onProjectSelectionSave({ type, project }:{ type:PrincipalType, project:any }) {
    this.type = type;
    this.category = project;
    this.goTo(Steps.Principal);
  }

  onPrincipalSave({ principalData, isAlreadyMember }:{ principalData:PrincipalData, isAlreadyMember:boolean }) {
    this.principalData = principalData;
    if (isAlreadyMember) {
      return this.closeWithPrincipal();
    }

    this.goTo(Steps.Role);
  }

  onRoleSave(role:RoleResource) {
    this.role = role;

    if (this.type === PrincipalType.Placeholder) {
      this.goTo(Steps.Summary);
    } else {
      this.goTo(Steps.Message);
    }
  }

  onMessageSave({ message }:{ message:string }) {
    this.message = message;
    this.goTo(Steps.Summary);
  }

  onSuccessfulSubmission($event:{ principal:HalResource }) {
    if (this.principalData.principal !== $event.principal && this.type === PrincipalType.User) {
      this.createdNewPrincipal = true;
    }
    this.principalData.principal = $event.principal;
    this.goTo(Steps.Success);
  }

  goTo(step:Steps) {
    this.step = step;
  }

  closeWithPrincipal() {
    this.data = this.principalData.principal;
    this.closeMe();
  }
}
