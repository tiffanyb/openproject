import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NgSelectModule } from '@ng-select/ng-select';
import { CurrentUserModule } from 'core-app/core/current-user/current-user.module';
import { OpenprojectModalModule } from 'core-app/shared/components/modal/modal.module';
import { InviteUserButtonModule } from 'core-app/features/invite-user-modal/button/invite-user-button.module';
import { DynamicFormsModule } from 'core-app/shared/components/dynamic-forms/dynamic-forms.module';
import { OpInviteUserModalAugmentService } from 'core-app/features/invite-user-modal/invite-user-modal-augment.service';
import { OPSharedModule } from 'core-app/shared/shared.module';
import { OpInviteUserModalService } from 'core-app/features/invite-user-modal/invite-user-modal.service';
import { OpTaskTemplateService } from 'core-app/features/invite-user-modal/task-template.service';
import { InviteUserModalComponent } from './invite-user.component';
import { TaskTemplateComponent } from './task-template.component';
import { ProjectSelectionComponent } from './project-selection/project-selection.component';
import { CategoryComponent } from './category/category.component';
import { ProjectSearchComponent } from './project-selection/project-search.component';
import { PrincipalComponent } from './principal/principal.component';
import { PrincipalSearchComponent } from './principal/principal-search.component';
import { RoleComponent } from './role/role.component';
import { RoleSearchComponent } from './role/role-search.component';
import { MessageComponent } from './message/message.component';
import { SummaryComponent } from './summary/summary.component';
import { SuccessComponent } from './success/success.component';

export function initializeServices(injector:Injector) {
  return function () {
    const inviteUserAugmentService = injector.get(OpInviteUserModalAugmentService);
    inviteUserAugmentService.setupListener();
  };
}

@NgModule({
  imports: [
    CommonModule,
    OPSharedModule,
    OpenprojectModalModule,
    NgSelectModule,
    ReactiveFormsModule,
    TextFieldModule,
    DynamicFormsModule,
    InviteUserButtonModule,
    CurrentUserModule,
  ],
  exports: [
    InviteUserButtonModule,
  ],
  declarations: [
    InviteUserModalComponent,
    TaskTemplateComponent,
    CategoryComponent,
    ProjectSelectionComponent,
    ProjectSearchComponent,
    PrincipalComponent,
    PrincipalSearchComponent,
    RoleComponent,
    RoleSearchComponent,
    MessageComponent,
    SuccessComponent,
    SummaryComponent,
  ],
  providers: [
    OpInviteUserModalService,
    {
      provide: APP_INITIALIZER, useFactory: initializeServices, deps: [Injector], multi: true,
    },
    OpTaskTemplateService,
  ],
})
export class OpenprojectInviteUserModalModule {
}
