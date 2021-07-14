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

  weeks: number;
}

export interface calendarEvent {
  id: string;
  title: string;
  duration: string;
  color: string;
  rrule: {
    freq: string;
    dtstart: string;
    interval: number;
    count: number;
  };
}
export interface EventColors {
  [key: string]: { description: string; gradientColor: string; icon: string };
}
// Profile interfaces
export interface PersonalInformation {
  uid: string | undefined;
  fullName: string | undefined;
  department: string | undefined;
  position: string | undefined;
  joinedIn: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  mbway: string | undefined;
  university: string | undefined;
  degree: string | undefined;
  studentId: string | undefined;
  idCard: string | undefined;
  nif: string | undefined;
  country: string | undefined;
  birth: string | undefined;
  address: string | undefined;
  city: string | undefined;
  zip: string | undefined;
  iban: string | undefined;
  linkedin: string | undefined;
  inTeam: boolean | undefined;
  departmentStats: Number | undefined;
  generalStats: Number | undefined;
  gender: string | undefined;
  curricularYear: Number | undefined;
}

export interface tableColumns {
  field: string;
  sortable: boolean;
  pinned?: string;
  comparator?: any;
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
  tasks?: { [key: string]: taskShape };
  statistics?: {
    departmentStats?: { [key: string]: EventInformation };
    generalStats?: { [key: string]: EventInformation };
  };
  notifications?: {
    all?: Notification;
    new?: Notification;
  };
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
}