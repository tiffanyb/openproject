import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InviteUserButtonComponent } from 'core-app/features/invite-user-modal/button/invite-user-button.component';
import { CCButtonComponent } from 'core-app/features/invite-user-modal/button/cc-button.component';
import { IconModule } from 'core-app/shared/components/icon/icon.module';

@NgModule({
  declarations: [
    InviteUserButtonComponent,
    CCButtonComponent,
  ],
  imports: [
    CommonModule,
    IconModule,
  ],
  exports: [
    InviteUserButtonComponent,
    CCButtonComponent,
  ],
})
export class InviteUserButtonModule { }
