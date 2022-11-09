describe("scenario for the saucedemo ", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.fixture("users").then(function (userData) {
      this.userData = userData;
    });
  });
  it("should login with the standard user", () => {
    cy.fixture("users").then(function () {
      cy.userLogin(
        this.userData.user_standard,
        this.userData.password_standard
      );
    });
  });
  it("should not login with the locked user", () => {
    cy.fixture("users").then(function () {
      cy.userLogin(this.userData.user_locked, this.userData.password_locked);
      cy.get('[data-test="error"]').should("be.visible");
      cy.get('[data-test="username"]').should(
        "have.css",
        "border-bottom-color"
      );
    });
  });
  it("should allow standard user to add items to the cart", () => {
    cy.fixture("users").then(function () {
      cy.userLogin(
        this.userData.user_standard,
        this.userData.password_standard
      );
    });
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').should(
      "have.text",
      "Add to cart"
    );
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get(".shopping_cart_badge").should("contain", 1);
  });
  it("should allow the standard user to apply the filter", () => {
    cy.fixture("users").then(function () {
      cy.userLogin(
        this.userData.user_standard,
        this.userData.password_standard
      );
    });
    //Using the filter Price(low to high)

    cy.get('[data-test="product_sort_container"]').select(
      "Price (low to high)"
    );
    cy.get(".inventory_item")
      .should("have.length.gt", 1)
      .then((items) => {
        cy.get(".inventory_item_price").should("have.length", items.length);
      });
    //Verifying the price is sorted from low to high

    cy.get(".inventory_item_price").then(($prices) => {
      const price = Cypress._.map($prices, (p) => p.innerText);
      cy.log(price.slice(0, 9).join(","));
      const onlyDigits = (str) => str.replace(/[^0-9.]/g, "");
      const digits = price.map(onlyDigits);
      cy.log(digits.slice(0, 9).join(","));
      const numbers = digits.map(parseFloat);
      cy.log(numbers.slice(0, 9).join(","));

      const sortedPrice = Cypress._.sortBy(numbers);
      expect(sortedPrice).to.deep.equal(numbers);
    });
  });
  it("should allow standard_user to perform a checkout", () => {
    cy.fixture("users").then(function () {
      cy.userLogin(
        this.userData.user_standard,
        this.userData.password_standard
      );
    });
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get(".shopping_cart_link").click();
    cy.get('[data-test="checkout"]').click();
    cy.userDetails("Standard", "User", "44600");
    cy.get('[data-test="finish"]').click();
    cy.contains(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!"
    ).should("be.visible");
    cy.url().should("eq", "https://www.saucedemo.com/checkout-complete.html");
  });
});
