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
import { ProjectAllowedValidator } from './project-allowed.validator';
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
  
  @ViewChild('displayContainer', { static: true }) readonly displayContainer:ElementRef;
  @ViewChild('editContainer', { static: true }) readonly editContainer:ElementRef;

  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<{ project:any, type:string }>();

  public displayPlaceholder = "";

  public fieldRenderer:DisplayFieldRenderer;
  
  public editFieldContainerClass = editFieldContainerClass;

  public text = {
    title: "Create Task",
    project: {
      required: this.I18n.t('js.invite_user_modal.project.required'),
      lackingPermission: this.I18n.t('js.invite_user_modal.project.lacking_permission'),
      lackingPermissionInfo: this.I18n.t('js.invite_user_modal.project.lacking_permission_info'),
    },
    type: {
      required: this.I18n.t('js.invite_user_modal.type.required'),
    },
    nextButton: this.I18n.t('js.invite_user_modal.project.next_button'),
  };

  public typeOptions:IOpOptionListOption<string>[] = [
    {
      value: PrincipalType.User,
      title: this.I18n.t('js.invite_user_modal.type.user.title'),
      description: this.I18n.t('js.invite_user_modal.type.user.description'),
    },
    {
      value: PrincipalType.Group,
      title: this.I18n.t('js.invite_user_modal.type.group.title'),
      description: this.I18n.t('js.invite_user_modal.type.group.description'),
    },
  ];

  public testTemplate:string[] = [
    'Function name',
    'POV ID',
  ];

  projectAndTypeForm = new FormGroup({
    type: new FormControl(PrincipalType.User, [Validators.required]),
    project: new FormControl(null, [Validators.required], ProjectAllowedValidator(this.currentUserService)),
  });

  get typeControl() {
    return this.projectAndTypeForm.get('type');
  }

  get projectControl() {
    return this.projectAndTypeForm.get('project');
  }

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
    console.log(this.category);
    console.log(this.project);
    console.log(this.type);
    this.fieldRenderer = new DisplayFieldRenderer(this.injector, 'single-view', {});
    this.typeControl?.setValue(this.type);
    this.projectControl?.setValue(this.project);

    this.setPlaceholderOption();
    //this.render();
  }


  //public render() {
    //const el = this.fieldRenderer.render(this.category, "aaa", null, this.displayPlaceholder);
    //this.displayContainer.nativeElement.innerHTML = '';
    //this.displayContainer.nativeElement.appendChild(el);
  //}

  private setPlaceholderOption() {
    if (this.bannersService.eeShowBanners) {
      this.typeOptions.push({
        value: PrincipalType.Placeholder,
        title: this.I18n.t('js.invite_user_modal.type.placeholder.title_no_ee'),
        description: this.I18n.t('js.invite_user_modal.type.placeholder.description_no_ee', {
          eeHref: this.bannersService.getEnterPriseEditionUrl({
            referrer: 'placeholder-users',
            hash: 'placeholder-users',
          }),
        }),
        disabled: true,
      });
    } else {
      this.typeOptions.push({
        value: PrincipalType.Placeholder,
        title: this.I18n.t('js.invite_user_modal.type.placeholder.title'),
        description: this.I18n.t('js.invite_user_modal.type.placeholder.description'),
        disabled: false,
      });
    }
  }

  onSubmit($e:Event) {
    $e.preventDefault();
    if (this.projectAndTypeForm.invalid) {
      this.projectAndTypeForm.markAsDirty();
      return;
    }

    this.save.emit({
      project: this.projectControl?.value,
      type: this.typeControl?.value,
    });
  }
  
  //private displayField(change:WorkPackageChangeset, name:string):DisplayField {
    //console.log(name);
    //return this.displayFieldService.getField(
      //change.projectedResource,
      //name,
      //change.schema.ofProperty(name),
      //{ container: 'single-view', injector: this.injector, options: {} },
    //);
  //}
}
