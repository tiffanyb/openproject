// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2022 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See COPYRIGHT and LICENSE files for more details.
//++

import { Injector, ElementRef, ChangeDetectorRef, Inject, Component, InjectFlags, OnInit, InjectionToken } from '@angular/core';
import { HalResource } from 'core-app/features/hal/resources/hal-resource';
import { SelectAutocompleterRegisterService } from 'core-app/shared/components/fields/edit/field-types/select-edit-field/select-autocompleter-register.service';
import { from } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { InjectField } from 'core-app/shared/helpers/angular/inject-field.decorator';
import { CreateAutocompleterComponent } from 'core-app/shared/components/autocompleter/create-autocompleter/create-autocompleter.component';
import { EditFormComponent } from 'core-app/shared/components/fields/edit/edit-form/edit-form.component';
import { StateService } from '@uirouter/core';
import { CollectionResource } from 'core-app/features/hal/resources/collection-resource';
import { HalResourceNotificationService } from 'core-app/features/hal/services/hal-resource-notification.service';
import { HalResourceSortingService } from 'core-app/features/hal/services/hal-resource-sorting.service';
import { EditFieldComponent } from '../../edit-field.component';

import { EditFieldHandler } from 'core-app/shared/components/fields/edit/editing-portal/edit-field-handler';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { Field, IFieldSchema } from 'core-app/shared/components/fields/field.base';
import { ResourceChangeset } from 'core-app/shared/components/fields/changeset/resource-changeset';
import { OpTaskTemplateService } from 'core-app/features/invite-user-modal/task-template.service';
import { HalResourceEditFieldHandler } from 'core-app/shared/components/fields/edit/field-handler/hal-resource-edit-field-handler';
import { HalResourceEditingService } from 'core-app/shared/components/fields/edit/services/hal-resource-editing.service';

export interface ValueOption {
  name:string;
  href:string|null;
}

@Component({
  templateUrl: './select-edit-field.component.html',
})
export class SelectEditFieldComponent extends EditFieldComponent implements OnInit {
  @InjectField() selectAutocompleterRegister:SelectAutocompleterRegisterService;

  @InjectField() halNotification:HalResourceNotificationService;

  @InjectField() halSorting:HalResourceSortingService;

  @InjectField() $state:StateService;

  @InjectField(EditFormComponent, null, InjectFlags.Optional) editFormComponent:EditFormComponent;

  public availableOptions:any[];

  public text:{ [key:string]:string };

  public appendTo:any = null;

  public referenceOutputs:{ [key:string]:Function } = {
    onCreate: (newElement:HalResource) => this.onCreate(newElement),
    onChange: (value:HalResource) => this.onChange(value),
    onKeydown: (event:JQuery.TriggeredEvent) => this.handler.handleUserKeydown(event, true),
    onOpen: () => this.onOpen(),
    onClose: () => this.onClose(),
    onAfterViewInit: (component:CreateAutocompleterComponent) => this._autocompleterComponent = component,
  };

  public get selectedOption() {
    const href = this.value ? this.value.href : null;
    return _.find(this.availableOptions, (o) => o.href === href)!;
  }

  public set selectedOption(val:ValueOption|HalResource) {
    // The InviteUserModal gives us a resource that is not in availableOptions yet,
    // but we also don't want to wait for a refresh of the options every time we want to
    // select an option, so if we get a HalResource we trust it exists
    if (val instanceof HalResource) {
      this.value = val;
      return;
    }

    const option = _.find(this.availableOptions, (o) => o.href === val.href);

    // Special case 'null' value, which angular
    // only understands in ng-options as an empty string.
    if (option && option.href === '') {
      option.href = null;
    }

    this.value = option;
  }

  public showAddNewButton:boolean;

  protected valuesLoaded = false;

  protected _autocompleterComponent:CreateAutocompleterComponent;

  private hiddenOverflowContainer = '.__hidden_overflow_container';

  /** Remember the values loading promise which changes as soon as the changeset is updated
   * (e.g., project or type is changed).
   */
  private valuesLoadingPromise:Promise<unknown>;

  public ngOnInit() {
    super.ngOnInit();
    this.appendTo = this.overflowingSelector;

    this.handler
      .$onUserActivate
      .pipe(
        this.untilDestroyed(),
      )
      .subscribe(() => {
        this.valuesLoadingPromise.then(() => {
          this._autocompleterComponent.openDirectly = true;
        });
      });

    this._syncUrlParamsOnChangeIfNeeded(this.handler.fieldName, this.editFormComponent?.editMode);
  }

  protected initialize() {
    this.text = {
      requiredPlaceholder: this.I18n.t('js.placeholders.selection'),
      placeholder: this.I18n.t('js.placeholders.default'),
    };

    this.valuesLoadingPromise = this.change.getForm().then(() => this.initialValueLoading());

    this.initializeShowAddButton();
  }

  initializeShowAddButton() {
    this.showAddNewButton = this.schema.type === 'User';
  }

  protected initialValueLoading() {
    this.valuesLoaded = false;
    return this.loadValues().toPromise();
  }

  public autocompleterComponent() {
    const { type } = this.schema;
    return this.selectAutocompleterRegister.getAutocompleterOfAttribute(type) || CreateAutocompleterComponent;
  }

  private setValues(availableValues:HalResource[]) {
    this.availableOptions = this.sortValues(availableValues);
    this.addEmptyOption();
  }

  protected loadValues(query?:string) {
    const { allowedValues } = this.schema;

    if (Array.isArray(allowedValues)) {
      this.setValues(allowedValues);
      this.valuesLoaded = true;
    } else if (allowedValues && !this.valuesLoaded) {
      return this.loadValuesFromBackend(query);
    } else {
      this.setValues([]);
    }

    return from(Promise.resolve(this.availableOptions));
  }

  protected loadValuesFromBackend(query?:string) {
    return from(
      this.loadAllowedValues(query),
    ).pipe(
      map((collection) => {
        if (collection.count === undefined || collection.total === undefined || (!query && collection.total === collection.count) || !this.value) {
          return collection.elements;
        }
        return collection.elements.concat([this.value]);
      }),
      tap((elements) => this.setValues(elements)),
      map(() => this.availableOptions),
    );
  }

  protected loadAllowedValues(query?:string):Promise<CollectionResource> {
    // Cache the search without any params
    if (!query) {
      const cacheKey = this.schema.allowedValues.$link.href;
      return this.change.cacheValue(cacheKey, this.fetchAllowedValueQuery.bind(this));
    }

    return this.fetchAllowedValueQuery(query);
  }

  protected fetchAllowedValueQuery(query?:string) {
    return this.schema.allowedValues.$link.$fetch(this.allowedValuesFilter(query)) as Promise<CollectionResource>;
  }

  private addValue(val:HalResource) {
    this.availableOptions.push(val);
  }

  public get currentValueInvalid():boolean {
    return !!(
      (this.value && !_.some(this.availableOptions, (option:HalResource) => (option.href === this.value.href)))
      || (!this.value && this.schema.required)
    );
  }

  public onCreate(newElement:HalResource) {
    this.addValue(newElement);
    this.selectedOption = { name: newElement.name, href: newElement.href };
    this.handler.handleUserSubmit();
  }

  public onOpen() {
    jQuery(this.hiddenOverflowContainer).one('scroll', () => {
      this._autocompleterComponent.closeSelect();
    });
  }

  public onClose() {
    // Nothing to do
  }

  public onChange(value:HalResource|undefined|null) {
    // VERY DIRTY HACK!!! DON'T DO THIS.
    /*
    if(this.name == 'category') {
      const category = value;

      if(category != null && category.id != null) {
        const service = this.injector.get(OpTaskTemplateService);
        service.open(category);
        service.close.pipe(first()).subscribe((data : { [key:string] : any }) => {
          let handler = this.handler as HalResourceEditFieldHandler;
          let task = handler.resource.$copy();
          let halEditing = this.injector.get(HalResourceEditingService);
          const change = halEditing.edit(task);

          // No input
          if(data == null) {
            return;
          }

          let format_text = '';
          for(let key in data) {
            format_text += "* " + key + ': ' + data[key] + '\n';
          }
          change.setValue('description', {raw: format_text});
          console.log(change.changes);
          
          if(value) {
            this.selectedOption = value;
          }
          halEditing.save(change).then(() => { });
          return;

        });
        return;
      }
      return;
    }
    */

    if (value) {
      this.selectedOption = value;
      this.handler.handleUserSubmit();
      return;
    }

    const emptyOption = this.getEmptyOption();

    if (emptyOption) {
      this.selectedOption = emptyOption;
      this.handler.handleUserSubmit();
    }
  }

  private addEmptyOption() {
    // Empty options are not available for required fields
    if (this.isRequired()) {
      return;
    }

    // Since we use the original schema values, avoid adding
    // the option if one is returned / exists already.
    const emptyOption = this.getEmptyOption();
    if (emptyOption === undefined) {
      this.availableOptions.unshift({
        name: this.text.placeholder,
        href: '',
      });
    }
  }

  protected isRequired() {
    return this.schema.required;
  }

  protected sortValues(availableValues:HalResource[]) {
    return this.halSorting.sort(availableValues);
  }

  // Subclasses shall be able to override the filters with which the
  // allowed values are reduced in the backend.
  protected allowedValuesFilter(query?:string) {
    return {};
  }

  private getEmptyOption():undefined {
    return _.find(this.availableOptions, (el) => el.name === this.text.placeholder);
  }

  private _syncUrlParamsOnChangeIfNeeded(fieldName:string, editMode:boolean) {
    // Work package type changes need to be synced with the type url param
    // in order to keep the form changes (changeset) between route/state changes
    if (fieldName === 'type' && editMode) {
      this.handler.registerOnBeforeSubmit(() => {
        const newType = this.value?.$source?.id;

        if (newType) {
          this.$state.go('.', { type: newType }, { notify: false });
        }
      });
    }
  }
}
