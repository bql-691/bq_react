export abstract class PageViewModel {
  created(): void {}
  ready(): void {}
  dispose(): void {}
  beforeRefresh(): void {}
  beforeSuspend(): void {}
  resume(): void {}
}
