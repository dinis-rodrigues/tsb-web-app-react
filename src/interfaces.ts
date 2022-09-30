import { ColorPickerValue } from "react-rainbow-components/components/ColorPicker";

export interface ApplicationFeatures {
  [key: string]: FeaturePermissions;
}

export interface FeaturePermissions {
  public: boolean;
  admin: boolean;
  god: boolean;
}

// Public Information
export interface PublicTeam {
  [key: string]: PublicUser;
}

export interface PublicUser {
  info: PublicUserInfo;
}

export interface PublicUserInfo {
  name: string;
  position: string;
  degree: string;
  birth: string;
  department: string;
  joinedIn: string;
  leftIn?: string;
  linkedin?: string;
  description?: string;
  email?: string;
  inTeam: boolean;
  userName?: string;
}

// Application Settings
export interface ApplicationSettings {
  registrationIsOpen: boolean;
  maintenanceIsOpen: boolean;
}

export interface Departments {
  [key: string]: Department;
}

export interface DepartmentsWithDesc {
  [key: string]: Department;
}

export interface Department {
  acronym: string;
  color: string;
  description: string;
  gradientColor: string;
  icon: string;
  positions: string[];
}

export interface DepartmentModalText {
  title: string;
  saveButton: string;
  creatingNewDepartment: boolean;
}

// Notifications
export interface Notifications {
  [key: string]: Notification;
}
export interface Notification {
  sentBy: string;
  sentByName?: string;
  title: string;
  description: string;
  urlPath: string;
  urlObject?: UrlObject | null;
  type: string;
  color: string;
  timestamp: number;
}

export interface UrlObject {
  pathname: string;
  elId: string;
  colId: string;
}

// Recruitment
export interface RecruitmentData {
  activeTable: boolean | string;
  tables: RecruitmentTables;
  tablesList: string[];
  openDepartments: Departments;
}

export interface RecruitmentTables {
  [key: string]: RecruitmentTable;
}
export interface RecruitmentTable {
  [key: string]: RecruitmentUser;
}
export interface RecruitmentUser {
  name: string;
  departments: string[];
  email: string;
  phone: string;
  link: string;
  degree: string;
  year: string;
  message: string;
  timestamp: number | string | null;
  country?: string;
  applicationId?: string; // this is not in the database but its added a posteriori for recruitment table rows
}

export interface RecruitmentTableSQL {
  data: RecruitmentSQLUser[];
}
export interface RecruitmentSQLUser {
  Nome: string;
  Email: string;
  Areas: string;
  Curso: string;
  Ano: number | string | null;
  Mensagem: string;
  Telemovel?: string;
  Facebook?: string;
  timedata: string | null;
}

// Forum interfaces
export interface ForumMetadata {
  // section encoded name
  [key: string]: TopicsMetadata;
}

export interface TopicsMetadata {
  [key: string]: TopicInformation;
}
export interface TopicInformation {
  createdAt: number;
  createdBy: string;
  createdByName: string;
  encodedSectionName: string;
  encodedTopicName: string;
  latestUpdate: string;
  latestUpdateTimestamp: number;
  latestUpdateUrl: string;
  latestUserUpdate: string;
  latestUserNameUpdate: string;
  numberReplies: number;
  numberThreads: number;
  sectionName: string;
  topicName: string;
}
export interface routeForumTopic {
  encodedSectionName: string;
  encodedTopicName: string;
}
export interface routeForumThread {
  encodedSectionName: string;
  encodedTopicName: string;
  encodedThreadName: string;
}

export interface ForumTopicMetadata {
  [key: string]: ThreadMetadata;
}

export interface ThreadMetadata {
  createdAt: number;
  createdBy: string;
  createdByName: string;
  latestUpdateTimestamp: number;
  latestUserNameUpdate: string;
  latestUserUpdate: string;
  numberReplies: number;
  recentUpdateViewedBy: { [key: string]: string };
  sectionName: string;
  threadLabel: string;
  threadTitle: string;
  // threadTitlePath: string;
  topicName: string;
  likedBy: { [key: string]: string };
  likedByName?: { [key: string]: string };
  viewedBy: { [key: string]: string };
  watchList: { [key: string]: string };
}
export interface ThreadCreation {
  title: string;
  label: selectOption;
  description: string;
}

export interface Thread {
  sectionName: string;
  topicName: string;
  htmlContent: string;
  threadTitle: string;
  threadTitlePath?: string;
  threadLabel: string;
  createdBy: string;
  createdByName: string;
  createdByDepartment?: string;
  createdByPosition?: string;
  createdByJoinedIn?: string;
  createdAt: number;
  latestUpdateTimestamp: number;
  latestUserUpdate: string;
  latestUserNameUpdate: string;
  watchList: { [key: string]: string };
  likedBy?: { [key: string]: string };
  likedByName?: string[];
  viewedBy: { [key: string]: string };
  recentUpdateViewedBy: { [key: string]: string };
  replies?: ThreadReplies;
}

export interface ThreadEdited {
  htmlContent: string;
  threadTitle: string;
  threadLabel: string;
  latestUpdateTimestamp: number;
  latestUserUpdate: string;
  latestUserNameUpdate: string;
}

export interface ThreadReplies {
  [key: string]: ThreadReplyInfo;
}
export interface ThreadReplyInfo {
  replyBy: string;
  replyHtml: string;
  replyTimestamp: number;
  latestUpdateTimestamp?: number;
  likedBy: { [key: string]: string };
}
export interface ThreadEditComment {
  id: string;
  threadComment: ThreadReplyInfo;
}
export interface PinnedThread {
  [key: string]: { [key: string]: { [key: string]: Thread } };
}
// Budget interfaces
export interface BomMaterial {
  assignedBy: string;
  assignedTo: selectOption;
  assignedToName: string;
  date: string;
  id?: string;
  description: string;
  from: string;
  quantity: number;
  status: string;
  toDepartment: string;
  totalValue: string;
  unitaryValue: string;
  comments?: taskComment;
  numComments: number;
  season: string;
}

export interface BomTableData {
  [key: string]: [string, BomMaterial][];
}

export interface EntireBom {
  [key: string]: { [key: string]: BomMaterial };
}
export interface BomDb {
  [key: string]: BomMaterial;
}

export interface BomMoney {
  acquired: number;
  total: number;
  percentage: number;
}

export interface bomDepartmentIconColorTitle {
  [key: string]: {
    title: string;
    icon: string;
    color: string;
  };
}

export interface AssignedUserMaterials {
  [key: string]: BomDb;
}

export interface RedirectedData {
  data: BomMaterial;
}

// Cash Flow interfaces
export interface FlowDB {
  [key: string]: Flow;
}
export interface Flow {
  id?: string;
  account: string;
  date: string;
  description: string;
  entity: string;
  type: "Expense" | "Income";
  value: string;
}

export interface tableFlowData {
  bank: [string, Flow, number][];
  idmec: [string, Flow, number][];
}

// Tasks interfaces
export interface AllUserTasks {
  [key: string]: { [key: string]: taskShape };
}
export interface UserTasks {
  [key: string]: taskShape;
}
export interface matchedRoute {
  departmentBoard: "tasksES" | "tasksMS" | "tasksDC" | "tasksMM" | "tasksHP";
  encodedCurrBoard: string;
}
export interface columnsShape {
  [key: string]: {
    name: string;
    items?: taskShape[];
    classNames: string;
  };
}
export interface taskShape {
  departmentBoard: string;
  currBoard: string;
  columnId: string;
  assignedBy?: string;
  assignedByName?: string;
  assignedTo?: selectOption[];
  completedObj: number;
  numComments: number;
  comments?: taskComment;
  date?: string;
  description?: string;
  priority?: string;
  status?: string;
  totalObj: number;
  id: string;
  title: string;
}
export interface taskComment {
  [key: string]: taskCommentInfo;
}

export interface taskCommentInfo {
  comment: string;
  timestamp: number;
  createdBy: string;
  createdByName: string;
}
export interface dragResult {
  combine: null;

  destination: { droppableId: string; index: number } | null;

  draggableId: string;

  mode: string;

  reason: string;

  source: { droppableId: string; index: number } | null;

  type: string;
}

export interface selectOption {
  value: string;
  label: string;
}
// Attendance interfaces
export interface Statistic {
  [key: string]: EventInformation;
}

export interface userStatus {
  title: string;
  badge: string;
  attended: boolean;
  missed: boolean;
}
export interface attendanceArrayApex {
  data: number[];
}
export interface attendanceArrayRechart {
  x: number;
  y: number;
}
export interface tooltipRechart {
  payload: { value: string; type: string; id: string }[];
  active: boolean;
  content: string;
}
export interface graphColor {
  name: string;
  gradient1: string;
  gradient2: string;
  gradient3: string;
  strokeColor: string;
}
// Events interfaces
export interface AllEvents {
  [key: string]: EventDatabase;
}
export interface EventDatabase {
  [key: string]: EventInformation;
}
export interface EventInformation {
  isHistory?: boolean;
  attended?: boolean;
  createdBy: string;
  date: string;
  description: string;
  duration: string;
  hours: string;
  link: string;
  minutes: string;
  title: string;
  type: string;
  allDay?: boolean;
  weeks: number;
}

export interface calendarEvent {
  id: string;
  title: string;
  duration?: string;
  color: string;
  allDay?: boolean;
  rrule: CalendarEventPeriodicRules;
}
export interface CalendarEventPeriodicRules {
  freq: string;
  dtstart: string;
  interval: number;
  count: number;
}
export interface EventColors {
  [key: string]: { description: string; gradientColor: string; icon: string };
}
// Profile interfaces
export interface PersonalInformation {
  uid?: string;
  fullName?: string;
  department?: string;
  position?: string;
  joinedIn?: string;
  leftIn?: string;
  name?: string;
  email?: string;
  phone?: string;
  mbway?: string;
  university?: string;
  degree?: string;
  studentId?: string;
  idCard?: string;
  nif?: string;
  country?: string;
  birth?: string;
  address?: string;
  city?: string;
  zip?: string;
  iban?: string;
  linkedin?: string;
  inTeam: boolean;
  departmentStats?: Number;
  generalStats?: Number;
  gender?: string;
  curricularYear?: Number;
  description?: string;
  userName: string;
}

export interface tableColumns {
  field: string;
  sortable: boolean;
  pinned?: string;
  comparator?: any;
  suppressSizeToFit?: boolean;
  filter?: boolean;
}

// User metadata shaoe
export interface UserMetadata {
  [key: string]: { pinfo: PersonalInformation };
}

export interface UsersDB {
  [key: string]: User;
}

// User shape
export interface User {
  pinfo: PersonalInformation;
}

export interface All {
  [key: string]: taskShape;
}
export interface UserBomMaterials {
  [key: string]: BomMaterial;
}

export interface DashTasksAndMaterials {
  [key: string]: BomMaterial & taskShape;
}

export interface Course {
  acronym: string;
  name: string;
  userMatches: string[];
}

// Table pdf inerface
export interface pdfExportOptions {
  /** styles to be applied to cells
    see supported list here: https://pdfmake.github.io/docs/0.1/document-definition-object/styling/. **/
  styles?: {
    background: String;
    fontSize: Number;
    bold: Boolean;
    color: String;
    alignment: "left" | "center" | "right";
  };
  /** creates a hyperlink for each value in a column **/
  createURL?: () => String;
  /** if true, does not include the column in the exported file **/
  skipColumn?: Boolean;
}

// User context
export interface userContext {
  id: string;
  name: string;
  department: string;
  position: string;
  joinedIn: string;
  usrImg: string;
  usrImgComp: string;
}

// Sponsors

export interface SponsorBracketsListDB {
  [key: string]: SponsorBracketListItem;
}

export interface SponsorBracketsDB {
  [key: string]: SponsorBracket;
}

export interface SponsorBracketListItem {
  name: string;
  bottomMargin: number;
  topMargin: number;
  numColumns: number;
  color?: ColorPickerValue;
}

export interface SponsorBracket {
  sponsorsBoardList: string[];
  bracketSponsors: SponsorsOrder;
}

export interface SponsorsOrder {
  [key: string]: Sponsor;
}
export interface Sponsor {
  order?: number;
  level: string;
  name: string;
  svgPath?: string;
  logoWhite?: string;
  logoBlack?: string;
  url: string;
  value?: number;
  history?: SponsorHistory;
  isRetroActive?: boolean;
  isBadQualityLogo?: boolean;
}

export interface SponsorHistory {
  [key: string]: {
    value: number;
    status?: number;
  };
}

export interface SponsorRetroactives {
  isActive: boolean;
  threshold: number;
  values: number[];
}

export interface SponsorChartData {
  name: string;
  data: number[];
}

export interface SponsorBracketPublic {
  sponsorsBoardList: string[];
  bracketSponsors: SponsorsOrderPublic;
  name: string;
  bottomMargin: number;
  topMargin: number;
  numColumns: number;
  color?: ColorPickerValue;
}

export interface SponsorsOrderPublic {
  [key: string]: SponsorPublic;
}

export interface SponsorPublic {
  name: string;
  svgPath?: string;
  url: string;
}

// Gallery
export interface PublicGallery {
  [key: string]: GalleryItem;
}
export interface GalleryItem {
  name: string;
  description?: string;
  timestamp: number;
}

export interface GalleryAlbum {
  [key: string]: GalleryPhoto;
}

export interface GalleryPhoto {
  imagePath: string;
  rzImgPath: string;
  description?: string;
  createdAt: number;
}

export interface UploadedImgResponse {
  success: boolean;
  msg: string;
  rzImg: string;
}

export interface UploadingImages {
  current: number;
  total: number;
  isUploading: boolean;
}
