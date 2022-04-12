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
import { ProjectResource } from 'core-app/features/hal/resources/project-resource';

@Component({
  templateUrl: './wp-wikiupd.component.html',
  styleUrls: ['./wp-wikiupd.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WpWikiUpdModalComponent extends OpModalComponent implements OnInit {
  /* Close on outside click */
  public closeOnOutsideClick = true;

  /* Data that is returned from the modal on close */
  public data:any = null;

  public project:ProjectResource|null = null;

  public get loading() {
    return this.locals.projectId && !this.project;
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

    if (this.locals.projectId) {
      this.apiV3Service.projects.id(this.locals.projectId).get().subscribe(
        (data) => {
          this.project = data;
          this.cdRef.markForCheck();
        },
        () => {
          this.locals.projectId = null;
          this.cdRef.markForCheck();
        },
      );
    }
  }

  onMessageSubmit({ message }:{ message:string }) {
    this.data = message;
    this.closeMe();
  }
}
