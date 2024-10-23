/* The interface is a list of rules that define whats mandatory for a 'page' to contain in our page-object model 
In this instance all pages should have a goTo method, and a path.
The implementation of these may differ, but all pages should have these, hence the interface. */
export interface IPage {
  // This will navigate to the page  (e.g. hostname + path).
  goTo(): void;
  // This is the path of the page.
  path: string;
}
