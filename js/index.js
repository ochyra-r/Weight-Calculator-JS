class App {
  //parameters
  minWeight = 30;
  maxWeight = 130;
  minHeight = 120;
  maxHeight = 220;

  weightUnit = "kg";
  heightUnit = "cm";

  //elements
  initialWeightInput = null;
  desiredWeightInput = null;
  heightInput = null;
  startDateInput = null;
  endDateInput = null;
  button = null;
  initialWeightResult = null;
  desiredWeightResult = null;
  heightResult = null;
  form = null;

  DOMElements = {
    initialWeightInput: "weight-initial",
    desiredWeightInput: "weight-desired",
    heightInput: "height",
    startDateInput: "start-date",
    endDateInput: "end-date",
    button: "[data-button]",
    initialWeightResult: "[data-initial-weight-result]",
    desiredWeightResult: "[data-desired-weight-result]",
    heightResult: "[data-height-result]",
    form: "[data-form]",
    result: "[data-result]",
  };

  initializeApp() {
    this.handleElements();
    this.setInitialValues();

    this.addEventListeners();
  }

  addEventListeners() {
    this.initialWeightInput.addEventListener("input", () => {
      this.initialWeightResult.textContent = this.getValueWithUnit(
        this.initialWeightInput.value,
        this.weightUnit
      );
    });
    this.desiredWeightInput.addEventListener("input", () => {
      this.desiredWeightResult.textContent = this.getValueWithUnit(
        this.desiredWeightInput.value,
        this.weightUnit
      );
    });
    this.heightInput.addEventListener("input", () => {
      this.heightResult.textContent = this.getValueWithUnit(
        this.heightInput.value,
        this.heightUnit
      );
    });
    this.startDateInput.addEventListener("change", () =>
      this.setEndDateMinAndValue()
    );
    this.button.addEventListener("click", () => this.count());
  }

  handleElements() {
    this.initialWeightInput = document.getElementById(
      this.DOMElements.initialWeightInput
    );
    this.desiredWeightInput = document.getElementById(
      this.DOMElements.desiredWeightInput
    );
    this.heightInput = document.getElementById(this.DOMElements.heightInput);
    this.startDateInput = document.getElementById(
      this.DOMElements.startDateInput
    );
    this.endDateInput = document.getElementById(this.DOMElements.endDateInput);
    this.button = document.querySelector(this.DOMElements.button);
    this.initialWeightResult = document.querySelector(
      this.DOMElements.initialWeightResult
    );
    this.desiredWeightResult = document.querySelector(
      this.DOMElements.desiredWeightResult
    );
    this.heightResult = document.querySelector(this.DOMElements.heightResult);
    this.form = document.querySelector(this.DOMElements.form);
  }

  setInitialValues() {
    this.setInputValues(
      this.initialWeightInput,
      this.minWeight,
      this.maxWeight
    );
    this.setInputValues(
      this.desiredWeightInput,
      this.minWeight,
      this.maxWeight
    );

    this.setInputValues(this.heightInput, this.minHeight, this.maxHeight);

    this.startDateInput.valueAsDate = this.getCurrentDate();
    this.endDateInput.valueAsDate = this.getCurrentDate();

    this.startDateInput.min = this.getCurrentDate().toISOString().split("T")[0];
    this.endDateInput.min = this.getCurrentDate().toISOString().split("T")[0];

    this.initialWeightResult.textContent = this.getValueWithUnit(
      this.initialWeightInput.value,
      this.weightUnit
    );
    this.desiredWeightResult.textContent = this.getValueWithUnit(
      this.desiredWeightInput.value,
      this.weightUnit
    );
    this.heightResult.textContent = this.getValueWithUnit(
      this.heightInput.value,
      this.heightUnit
    );
  }

  count() {
    const weightDifference = this.getWeightDifference();

    const currentBMI = this.getBMI(
      this.initialWeightInput.value,
      this.heightInput.value
    );
    const desiredBMI = this.getBMI(
      this.desiredWeightInput.value,
      this.heightInput.value
    );

    const currentBMIDescription = this.getBMIDescription(currentBMI);
    const desiredBMIDescription = this.getBMIDescription(desiredBMI);

    const changePerDay = this.getChangePerDay();
    const changePerWeek = this.getChangePerWeek();

    const previousResult = document.querySelector(this.DOMElements.result);
    if (previousResult) {
      previousResult.remove();
    }

    this.form.insertAdjacentHTML(
      "afterend",
      this.getTemplate(
        weightDifference,
        currentBMI,
        desiredBMI,
        currentBMIDescription,
        desiredBMIDescription,
        changePerDay,
        changePerWeek
      )
    );
  }

  getTemplate(
    weightDifference,
    currentBMI,
    desiredBMI,
    currentBMIDescription,
    desiredBMIDescription,
    changePerDay,
    changePerWeek
  ) {
    const text = weightDifference > 0 ? "loose" : "gain";
    return !!weightDifference && !!this.getDateDifference()
      ? `
			<section class="result" data-result>
				<p class="result__paragraph">You want to ${text} <strong>${this.getValueWithUnit(
          Math.abs(weightDifference),
          this.weightUnit
        )}</strong></p>
				<p class="result__paragraph">
					Your current BMI is <strong>${currentBMI} </strong>(${currentBMIDescription})
				</p>
				<p class="result__paragraph">
					Your desired BMI is <strong>${desiredBMI} </strong>(${desiredBMIDescription})
				</p>
				<p class="result__paragraph">
					You should ${text} <strong>${this.getValueWithUnit(
          Math.abs(changePerDay).toFixed(2),
          this.weightUnit
        )}</strong> per day
				</p>
				${
          changePerWeek
            ? `<p class="result__paragraph">
					You should ${text} <strong>${this.getValueWithUnit(
                Math.abs(changePerWeek).toFixed(2),
                this.weightUnit
              )}</strong> per week
				</p>`
            : ""
        }
			</section>
		`
      : `	<section class="result" data-result>
			<p class="result__paragraph">
					Current and desired weight can't be eqal.
				</p>
				<p class="result__paragraph">
					Start date and end date should be differen.
				</p>
	</section>`;
  }

  setEndDateMinAndValue() {
    this.endDateInput.min = this.startDateInput.value;
    const getMinDateTime = new Date(this.endDateInput.min).getTime();
    const getValueDateTime = new Date(this.endDateInput.value).getTime();
    if (getMinDateTime > getValueDateTime) {
      this.endDateInput.value = this.endDateInput.min;
    }
  }

  setInputValues(element, minValue, maxValue) {
    element.min = minValue;
    element.max = maxValue;
    element.value = this.getAverage(minValue, maxValue);
  }

  getWeightDifference() {
    return (
      parseInt(this.initialWeightInput.value, 10) -
      parseInt(this.desiredWeightInput.value, 10)
    );
  }

  getBMI(weight, height) {
    const BMI = weight / (height / 100) ** 2;
    return BMI.toFixed(1);
  }

  getBMIDescription(bmi) {
    if (bmi < 15) return "Very severely underweight";
    if (bmi < 16) return "Severely underweight";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Moderately obese";
    if (bmi < 40) return "Severely obese";
    return "Very severely obese";
  }

  getChangePerDay() {
    const oneDay = 24 * 60 * 60 * 1000;
    const numberOfDays = this.getDateDifference() / oneDay;
    const changePerDay = numberOfDays
      ? this.getWeightDifference() / numberOfDays
      : null;

    return changePerDay;
  }

  getChangePerWeek() {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const numberOfWeeks = Math.floor(this.getDateDifference() / oneWeek);

    const changePerWeek = numberOfWeeks
      ? this.getWeightDifference() / numberOfWeeks
      : null;
    return changePerWeek;
  }

  getDateDifference() {
    return (
      new Date(this.endDateInput.value) - new Date(this.startDateInput.value)
    );
  }

  getAverage(valueOne, valueTwo) {
    return Math.round((valueOne + valueTwo) / 2);
  }

  getValueWithUnit(value, unit) {
    return `${value} ${unit}`;
  }

  getCurrentDate() {
    return new Date();
  }
}
