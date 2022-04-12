import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ElementRef,
  Injector,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { BannersService } from 'core-app/core/enterprise/banners.service';
import { CurrentUserService } from 'core-app/core/current-user/current-user.service';
import { IOpOptionListOption } from 'core-app/shared/components/option-list/option-list.component';
import { ProjectResource } from 'core-app/features/hal/resources/project-resource';
import { CategoryResource } from 'core-app/features/hal/resources/category-resource';
import { HalResource } from 'core-app/features/hal/resources/hal-resource';
import { PrincipalType } from '../invite-user.component';
import { DisplayFieldService } from 'core-app/shared/components/fields/display/display-field.service';
import { HalResourceEditingService } from 'core-app/shared/components/fields/edit/services/hal-resource-editing.service';
import { HalResourceService } from 'core-app/features/hal/services/hal-resource.service';

import { editFieldContainerClass, DisplayFieldRenderer, displayClassName, } from 'core-app/shared/components/fields/display/display-field-renderer';
@Component({
  selector: 'op-ium-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.sass'],
  providers: [HalResourceEditingService],
})
export class CategoryComponent implements OnInit {
  @Input() type:PrincipalType;
  
  @Input() category: HalResource;

  @Input() project:ProjectResource|null;

  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<any>();

  public text = {
    title: "Create Task",
    nextButton: this.I18n.t('js.invite_user_modal.project.next_button'),
  };

  categoryForm = new FormGroup({
  });

  constructor(
    readonly I18n:I18nService,
    readonly elementRef:ElementRef,
    readonly bannersService:BannersService,
    readonly currentUserService:CurrentUserService,
    protected displayFieldService:DisplayFieldService,
    protected halEditing:HalResourceEditingService,
    protected injector:Injector,
    protected halResourceService:HalResourceService,
  ) {}

  ngOnInit() { 
    for(var descriptor of this.category.keywords) {
      this.categoryForm.addControl(descriptor, new FormControl(''));
    }
  }

  onSubmit($e:Event) {
    $e.preventDefault();
    if (this.categoryForm.invalid) {
      this.categoryForm.markAsDirty();
      return;
    }

    var data: { [key: string] : any } = { };
    for(var descriptor of this.category.keywords) {
      const form = this.categoryForm.get(descriptor);
      data[descriptor] = form?.value;
    }
    this.save.emit(data);
  }
}
