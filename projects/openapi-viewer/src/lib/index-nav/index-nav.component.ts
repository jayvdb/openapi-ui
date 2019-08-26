import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { OperationsItem, PathItem, TagIndex } from '../models/openapi-viewer.model';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { OavSettings } from '../models/openapi-viewer.settings';

@Component({
  selector: 'oav-index-nav',
  templateUrl: './index-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexNavComponent implements OnInit, OnDestroy {
  openTags = new Set<string>();

  @Input() index: TagIndex[];

  showHoverLabel: boolean;
  showAuthentication: boolean;

  private sub: Subscription;

  constructor(private router: Router, @Optional() private oavSettings: OavSettings, private cd: ChangeDetectorRef) {
    if (!this.oavSettings) {
      this.oavSettings = OavSettings.default;
    }
    this.showHoverLabel = !!this.oavSettings.indexHoverLabel;
    this.showAuthentication = this.oavSettings.enableAuthentication;
  }

  ngOnInit() {
    this.checkOpenTags(this.router.routerState.snapshot.url);
    this.sub = this.router.events.pipe(filter(ev => ev instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.checkOpenTags(event.url);
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  checkOpenTags(url: string) {
    console.log('nav url', url);
    if (url.match(/\/(.+)\/(.+)/)) {
      const tag = RegExp.$1;
      this.openTags.add(tag);
    }
  }
}
