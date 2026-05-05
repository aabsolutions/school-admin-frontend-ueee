import { ConfigService } from '../../config/config.service';
import { NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  DOCUMENT
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import {
  LanguageService,
  RightSidebarService,
  InConfiguration,
  Role,
  AuthService,
} from '@core';
import { ProfilePhotoService } from '@core/service/profile-photo.service';
import { NotificationsApiService, AppNotification } from '@core/service/notifications-api.service';
import { NotificationsSocketService } from '@core/service/notifications-socket.service';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  message:       { icon: 'chat',                 color: 'nfc-blue' },
  system:        { icon: 'campaign',             color: 'nfc-orange' },
  enrollment:    { icon: 'assignment_turned_in', color: 'nfc-green' },
  expediente:    { icon: 'folder_special',       color: 'nfc-red' },
  dece:          { icon: 'psychology',           color: 'nfc-purple' },
  tramitologia:  { icon: 'description',          color: 'nfc-blush' },
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    RouterLink,
    NgClass,
    MatButtonModule,
    MatMenuModule,
    NgScrollbar,
    FeatherIconsComponent,
    MatIconModule,
    MatToolbarModule,
    MatBadgeModule,
  ],
})
export class HeaderComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  public config!: InConfiguration;
  userImg?: string;
  userName = '';
  homePage?: string;
  profileRoute = '/admin/account';
  isNavbarCollapsed = true;
  flagvalue: string | string[] | undefined;
  countryName: string | string[] = [];
  langStoreValue?: string;
  defaultFlag?: string;
  isOpenSidebar?: boolean;
  docElement?: HTMLElement;
  isFullScreen = false;

  notifications: AppNotification[] = [];
  unreadCount = 0;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private rightSidebarService: RightSidebarService,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    public languageService: LanguageService,
    public profilePhotoService: ProfilePhotoService,
    private notificationsApi: NotificationsApiService,
    private notificationsSocket: NotificationsSocketService,
  ) {
    super();
  }

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.svg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.svg', lang: 'de' },
  ];

  ngOnInit() {
    this.config = this.configService.configData;

    const currentUser = this.authService.currentUserValue;
    const userRole = currentUser.roles?.[0]?.name;
    this.userName = currentUser.name || currentUser['username'] || 'User';

    this.profilePhotoService.load();
    this.subs.sink = this.profilePhotoService.photo.subscribe(
      (url) => (this.userImg = url)
    );
    this.docElement = document.documentElement;

    if (userRole === Role.Admin) {
      this.homePage = 'admin/dashboard/main';
      this.profileRoute = '/admin/account';
    } else if (userRole === Role.Teacher) {
      this.homePage = 'teacher/dashboard';
      this.profileRoute = '/teacher/settings';
    } else if (userRole === Role.Student) {
      this.homePage = 'student/dashboard';
      this.profileRoute = '/student/settings';
    } else {
      this.homePage = 'admin/dashboard/main';
      this.profileRoute = '/admin/account';
    }

    this.langStoreValue = localStorage.getItem('lang') as string;
    const val = this.listLang.filter((x) => x.lang === this.langStoreValue);
    this.countryName = val.map((element) => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) {
        this.defaultFlag = 'assets/images/flags/us.svg';
      }
    } else {
      this.flagvalue = val.map((element) => element.flag);
    }

    this.loadNotifications();
    this.notificationsSocket.connect();
    this.subs.sink = this.notificationsSocket.newNotification$.subscribe((n) => {
      this.notifications = [n, ...this.notifications].slice(0, 20);
      this.unreadCount++;
    });
  }

  loadNotifications(): void {
    this.subs.sink = this.notificationsApi.getAll(1, 15).subscribe(({ data, unread }) => {
      this.notifications = data;
      this.unreadCount = unread;
    });
  }

  getIcon(type: string): string {
    return TYPE_ICON[type]?.icon ?? 'notifications';
  }

  getColor(type: string): string {
    return TYPE_ICON[type]?.color ?? 'nfc-blue';
  }

  onNotificationClick(n: AppNotification): void {
    if (!n.read) {
      n.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.notificationsApi.markRead(n._id).subscribe();
    }
    if (n.link) this.router.navigate([n.link]);
  }

  markAllRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.unreadCount = 0;
    this.notificationsApi.markAllRead().subscribe();
  }

  dismissNotification(n: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notifications = this.notifications.filter((x) => x._id !== n._id);
    if (!n.read) this.unreadCount = Math.max(0, this.unreadCount - 1);
    this.notificationsApi.deleteOne(n._id).subscribe();
  }

  timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return `${Math.floor(diff / 86400)} d`;
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      if (this.docElement?.requestFullscreen != null) {
        this.docElement?.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.langStoreValue = lang;
    this.languageService.setLanguage(lang);
  }

  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(className);
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }

  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'false');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'true');
    }
  }

  logout() {
    this.subs.sink = this.authService.logout().subscribe((res) => {
      if (!res.success) {
        this.router.navigate(['/authentication/signin']);
      }
    });
  }
}
