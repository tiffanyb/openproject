import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs/internal/operators/take';
import { map } from 'rxjs/operators';
import { ApiV3Service } from 'core-app/core/apiv3/api-v3.service';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { DynamicFormComponent } from 'core-app/shared/components/dynamic-forms/components/dynamic-form/dynamic-form.component';
import { ProjectResource } from 'core-app/features/hal/resources/project-resource';
import { HalResource } from 'core-app/features/hal/resources/hal-resource';

@Component({
  selector: 'op-ium-commit',
  templateUrl: './commit.component.html',
  styleUrls: ['./commit.component.sass'],
})
export class CommitComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<{ message:string }>();

  @Output() back = new EventEmitter();

	@Input() message = '';

	@ViewChild('input') input:ElementRef;

  public text = {
    title: () => "Closing task confirmation",
    label: "Task completion message",
    backButton: "Back",
    nextButton: "Next",
  };

  messageForm = new FormGroup({
    message: new FormControl(''),
  });

  get messageControl() {
    return this.messageForm.get('message');
  }

  constructor(
    readonly I18n:I18nService,
    readonly httpClient:HttpClient,
    readonly apiV3Service:ApiV3Service,
    readonly cdRef:ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.messageControl?.setValue(this.message);
  }

  ngAfterViewInit() {
    this.input.nativeElement.focus();
  }


  onSubmit($e:Event) {
    $e.preventDefault();
    if (this.messageForm.invalid) {
      this.messageForm.markAsDirty();
      return;
    }

    this.save.emit({ message: this.messageControl?.value });
  }
}
