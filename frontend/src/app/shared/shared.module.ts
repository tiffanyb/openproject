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
import { FormsModule } from '@angular/forms';
import {
  Injector,
  NgModule,
} from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { DragulaModule } from 'ng2-dragula';
import { DynamicModule } from 'ng-dynamic-component';
import {
  StateService,
  UIRouterModule,
} from '@uirouter/angular';
import { OpSpotModule } from 'core-app/spot/spot.module';
import { CurrentUserModule } from 'core-app/core/current-user/current-user.module';
import { IconModule } from 'core-app/shared/components/icon/icon.module';
import { AttributeHelpTextModule } from 'core-app/shared/components/attribute-help-texts/attribute-help-text.module';
import { IconTriggeredContextMenuComponent } from 'core-app/shared/components/op-context-menu/icon-triggered-context-menu/icon-triggered-context-menu.component';
import { CurrentProjectService } from 'core-app/core/current-project/current-project.service';
import { SortHeaderDirective } from 'core-app/features/work-packages/components/wp-table/sort-header/sort-header.directive';
import { ZenModeButtonComponent } from 'core-app/features/work-packages/components/wp-buttons/zen-mode-toggle-button/zen-mode-toggle-button.component';
import { OPContextMenuComponent } from 'core-app/shared/components/op-context-menu/op-context-menu.component';
import { OpenprojectPrincipalRenderingModule } from 'core-app/shared/components/principal/principal-rendering.module';
import { DatePickerModule } from 'core-app/shared/components/op-date-picker/date-picker.module';
import { FocusModule } from 'core-app/shared/directives/focus/focus.module';
import { EnterpriseBannerComponent } from 'core-app/shared/components/enterprise-banner/enterprise-banner.component';
import { EnterpriseBannerBootstrapComponent } from 'core-app/shared/components/enterprise-banner/enterprise-banner-bootstrap.component';
import { HomescreenNewFeaturesBlockComponent } from 'core-app/features/homescreen/blocks/new-features.component';
import { TablePaginationComponent } from 'core-app/shared/components/table-pagination/table-pagination.component';
import { HookService } from 'core-app/features/plugins/hook-service';
import { ViewSelectComponent } from 'core-app/shared/components/op-view-select/op-view-select.component';
import { StaticQueriesService } from 'core-app/shared/components/op-view-select/op-static-queries.service';
import {
  highlightColSelector,
  OpHighlightColDirective,
} from './directives/highlight-col/highlight-col.directive';
import { OpSearchHighlightDirective } from './directives/search-highlight.directive';

import { CopyToClipboardDirective } from './components/copy-to-clipboard/copy-to-clipboard.directive';
import { OpDateTimeComponent } from './components/date/op-date-time.component';
import { ToastComponent } from './components/toaster/toast.component';
import { ToastsContainerComponent } from './components/toaster/toasts-container.component';
import { UploadProgressComponent } from './components/toaster/upload-progress.component';
import { ResizerComponent } from './components/resizer/resizer.component';
import { CollapsibleSectionComponent } from './components/collapsible-section/collapsible-section.component';
import { NoResultsComponent } from './components/no-results/no-results.component';
import { EditableToolbarTitleComponent } from './components/editable-toolbar-title/editable-toolbar-title.component';
import { PersistentToggleComponent } from './components/persistent-toggle/persistent-toggle.component';
import { AddSectionDropdownComponent } from './components/hide-section/add-section-dropdown/add-section-dropdown.component';
import { HideSectionLinkComponent } from './components/hide-section/hide-section-link/hide-section-link.component';
import { RemoteFieldUpdaterComponent } from './components/remote-field-updater/remote-field-updater.component';
import { ShowSectionDropdownComponent } from './components/hide-section/show-section-dropdown.component';
import { SlideToggleComponent } from './components/slide-toggle/slide-toggle.component';
import { DynamicBootstrapModule } from './components/dynamic-bootstrap/dynamic-bootstrap.module';
import { OpCheckboxFieldComponent } from './components/forms/checkbox-field/checkbox-field.component';
import { OpFormFieldComponent } from './components/forms/form-field/form-field.component';
import { OpFormBindingDirective } from './components/forms/form-field/form-binding.directive';
import { OpOptionListComponent } from './components/option-list/option-list.component';
import { OpSidemenuComponent } from './components/sidemenu/sidemenu.component';
import { OpProjectIncludeComponent } from './components/project-include/project-include.component';
import { OpProjectListComponent } from './components/project-include/project-list.component';
import { ViewsResourceService } from 'core-app/core/state/views/views.service';
import { OpenprojectContentLoaderModule } from 'core-app/shared/components/op-content-loader/openproject-content-loader.module';

import { HttpClientModule } from '@angular/common/http';

export function bootstrapModule(injector:Injector) {
  // Ensure error reporter is run
  const currentProject = injector.get(CurrentProjectService);
  const routerState = injector.get(StateService);

  window.ErrorReporter.addContext((scope) => {
    if (currentProject.inProjectContext) {
      scope.setTag('project', currentProject.identifier);
    }

    scope.setExtra('router state', routerState.current.name);
  });

  const hookService = injector.get(HookService);
  hookService.register('openProjectAngularBootstrap', () => [
    {
      selector: highlightColSelector,
      cls: OpHighlightColDirective,
    },
  ]);
}

@NgModule({
  imports: [
    // UI router components (NOT routes!)
    UIRouterModule,
    // Angular browser + common module
    CommonModule,
    // Angular Forms
    FormsModule,
    OpSpotModule,
    // Angular CDK
    PortalModule,
    DragDropModule,
    DragulaModule,
    CurrentUserModule,
    NgSelectModule,
    NgOptionHighlightModule,

    DynamicBootstrapModule,
    OpenprojectPrincipalRenderingModule,
    OpenprojectContentLoaderModule,

    DatePickerModule,
    FocusModule,
    IconModule,
    AttributeHelpTextModule,

    HttpClientModule,
  ],
  exports: [
    // Re-export all commonly used
    // modules to DRY
    UIRouterModule,
    CommonModule,
    FormsModule,
    PortalModule,
    DragDropModule,
    IconModule,
    AttributeHelpTextModule,
    NgSelectModule,
    NgOptionHighlightModule,
    DynamicBootstrapModule,
    OpenprojectPrincipalRenderingModule,

    OpSpotModule,

    DatePickerModule,
    FocusModule,
    OpDateTimeComponent,

    ToastsContainerComponent,
    ToastComponent,
    UploadProgressComponent,
    OpDateTimeComponent,

    // Table highlight
    OpHighlightColDirective,

    OpSearchHighlightDirective,

    ResizerComponent,

    TablePaginationComponent,
    SortHeaderDirective,

    ZenModeButtonComponent,

    OPContextMenuComponent,
    IconTriggeredContextMenuComponent,

    NoResultsComponent,

    EditableToolbarTitleComponent,

    // Enterprise Edition
    EnterpriseBannerComponent,

    DynamicModule,

    // filter

    SlideToggleComponent,

    OpCheckboxFieldComponent,
    OpFormFieldComponent,
    OpFormBindingDirective,
    OpOptionListComponent,
    OpSidemenuComponent,
    OpProjectIncludeComponent,
    OpProjectListComponent,

    ViewSelectComponent,
  ],
  providers: [
    StaticQueriesService,
    ViewsResourceService,
  ],
  declarations: [
    OpDateTimeComponent,
    ViewSelectComponent,

    ToastsContainerComponent,
    ToastComponent,
    UploadProgressComponent,
    OpDateTimeComponent,

    OPContextMenuComponent,
    IconTriggeredContextMenuComponent,

    // Table highlight
    OpHighlightColDirective,

    // Add functionality to rails rendered templates
    CopyToClipboardDirective,
    CollapsibleSectionComponent,

    CopyToClipboardDirective,
    ResizerComponent,

    TablePaginationComponent,
    SortHeaderDirective,

    OpSearchHighlightDirective,

    // Zen mode button
    ZenModeButtonComponent,

    NoResultsComponent,

    EditableToolbarTitleComponent,

    PersistentToggleComponent,
    HideSectionLinkComponent,
    ShowSectionDropdownComponent,
    AddSectionDropdownComponent,
    RemoteFieldUpdaterComponent,

    // Enterprise Edition
    EnterpriseBannerComponent,
    EnterpriseBannerBootstrapComponent,

    HomescreenNewFeaturesBlockComponent,

    // filter
    SlideToggleComponent,

    OpCheckboxFieldComponent,
    OpFormFieldComponent,
    OpFormBindingDirective,
    OpOptionListComponent,
    OpSidemenuComponent,
    OpProjectIncludeComponent,
    OpProjectListComponent,
  ],
})
export class OPSharedModule {
  constructor(injector:Injector) {
    bootstrapModule(injector);
  }
}
