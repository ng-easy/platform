describe('image', () => {
  beforeEach(() => cy.visit('/iframe.html?id=imagecomponent--default'));
  it('should render the component', () => {
    cy.get('image[src]').should('exist');
  });
});
