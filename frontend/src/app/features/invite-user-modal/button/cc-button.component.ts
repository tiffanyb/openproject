import { Component, Input } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Observable } from 'rxjs';
import { CurrentUserService } from 'core-app/core/current-user/current-user.service';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { CurrentProjectService } from 'core-app/core/current-project/current-project.service';

import { OpTaskTemplateService } from 'core-app/features/invite-user-modal/task-template.service';

@Component({
  selector: 'op-cc-button',
  templateUrl: './cc-button.component.html',
  styleUrls: ['./invite-user-button.component.sass'],
})
export class CCButtonComponent {
  @Input() textContent:string;
  @Input() categoryId:string;
  @Input() projectId:string|null;

  /** This component does not provide an output, because both primary usecases were in places where the button was
   * destroyed before the modal closed, causing the data from the modal to never arrive at the parent.
   * If you want to do something with the output from the modal that is opened, use the TaskTemplateService 
   * and subscribe to the `close` event there.
   */

  canInviteUsersToProject$:Observable<boolean>;

  constructor(
    readonly I18n:I18nService,
    readonly opTaskTemplateService:OpTaskTemplateService,
    readonly currentProjectService:CurrentProjectService,
    readonly currentUserService:CurrentUserService,
    readonly ngSelectComponent:NgSelectComponent,
  ) {
  }

  public ngOnInit():void {
    this.projectId = this.projectId || this.currentProjectService.id;
    this.canInviteUsersToProject$ = this.currentUserService.hasCapabilities$(
      'memberships/create',
      this.projectId || undefined,
    );
  }

  public onAddNewClick($event:Event, categoryId:string):void {
    console.log(categoryId);
    $event.stopPropagation();
    this.opTaskTemplateService.open(categoryId);
    this.ngSelectComponent.close();
  }
}
