import { useState } from "react";

function App() {

    const MAX_INPUT_VALUE = 999_999_999;
  const [monthlyPayment, setMonthlyPayment] = useState("0");
  const [downPayment, setDownPayment] = useState("0");
  const [interestRate, setInterestRate] = useState("0");
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [hoaMonthlyFees, setHoaMonthlyFees] = useState("0");
  const [propertyTaxRate, setPropertyTaxRate] = useState("0");
  const [homeownersInsuranceRate, setHomeownersInsuranceRate] = useState("0");
  const [pmiRate, setPmiRate] = useState("0");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  async function calculateAffordability() {
      const validationError = validateInputs();
      if (validationError) {
          setErrorMessage(validationError);
          return;
      }
      setErrorMessage("");
      setIsLoading(true);
      try {
          const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/affordability/estimate`,
              {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      monthlyPayment: Number(monthlyPayment),
                      downPayment: Number(downPayment),
                      interestRate: Number(interestRate),
                      loanTermYears: Number(loanTermYears),
                      hoaMonthlyFees: Number(hoaMonthlyFees),
                      propertyTaxRate: Number(propertyTaxRate),
                      homeownersInsuranceRate: Number(homeownersInsuranceRate),
                      pmiRate: Number(pmiRate),
                  }),
              }
          );

          const data = await response.json();
          setResult(data.maxHomePrice);
      } catch (error) {
          console.error(error);
          setResult(0);
      } finally {
          setIsLoading(false);
      }
  }

    function validateDecimalPlaces(value: string, maxDecimals: number): boolean {
        if (!value.includes(".")) {
            return true;
        }
        const decimalPart = value.split(".")[1];
        return decimalPart.length <= maxDecimals;
    }

    function validateInputs(): string {
        const fields = [
            monthlyPayment,
            downPayment,
            interestRate,
            hoaMonthlyFees,
            propertyTaxRate,
            homeownersInsuranceRate,
            pmiRate
        ];
        for (const field of fields) {
            if (field.trim() === "") {
                return "All fields must contain numeric values.";
            }
            const numericValue = Number(field);
            if (isNaN(numericValue)) {
                return "All fields must be numeric.";
            }
            if (numericValue < 0) {
                return "Values cannot be negative.";
            }
            if (numericValue > MAX_INPUT_VALUE) {
                return `Values cannot exceed ${MAX_INPUT_VALUE.toLocaleString()}.`;
            }
        }
        if (!validateDecimalPlaces(monthlyPayment, 2)) {
            return "Monthly payment cannot exceed 2 decimal places.";
        }
        if (!validateDecimalPlaces(downPayment, 2)) {
            return "Down payment cannot exceed 2 decimal places.";
        }
        if (!validateDecimalPlaces(hoaMonthlyFees, 2)) {
            return "HOA fees cannot exceed 2 decimal places.";
        }
        if (!validateDecimalPlaces(interestRate, 4)) {
            return "Interest rate cannot exceed 4 decimal places.";
        }
        if (!validateDecimalPlaces(propertyTaxRate, 4)) {
            return "Property tax rate cannot exceed 4 decimal places.";
        }
        if (!validateDecimalPlaces(homeownersInsuranceRate, 4)) {
            return "Insurance rate cannot exceed 4 decimal places.";
        }
        if (!validateDecimalPlaces(pmiRate, 4)) {
            return "PMI rate cannot exceed 4 decimal places.";
        }
        return "";
    }

    function resetForm() {
        setMonthlyPayment("0");
        setDownPayment("0");
        setInterestRate("0");
        setHoaMonthlyFees("0");
        setPropertyTaxRate("0");
        setHomeownersInsuranceRate("0");
        setPmiRate("0");
        setLoanTermYears(30);
        setErrorMessage("");
        setResult(0);
    }

    return (
        <div style={{ padding: "32px", fontFamily: "Arial" }}>

            <h1>Home Affordability Estimator</h1>

            {errorMessage && (
                <div
                    style={{
                        color: "red",
                        marginBottom: "20px",
                        fontWeight: "bold"
                    }}
                >
                    {errorMessage}
                </div>
            )}

            <div
                style={{
                    display: "flex",
                    gap: "50px",
                    marginBottom: "20px"
                }}
            >

                {/* Left Column */}
                <div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>Desired Monthly Payment</label>
                        <br />
                        <input
                            type="number"
                            disabled={isLoading}
                            value={monthlyPayment}
                            onChange={(e) => setMonthlyPayment(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>Down Payment</label>
                        <br />
                        <input
                            type="number"
                            disabled={isLoading}
                            value={downPayment}
                            onChange={(e) => setDownPayment(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>Interest Rate (%)</label>
                        <br />
                        <input
                            type="number"
                            disabled={isLoading}
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>Loan Term</label>
                        <br />
                        <select
                            disabled={isLoading}
                            value={loanTermYears}
                            onChange={(e) =>
                                setLoanTermYears(Number(e.target.value))
                            }
                        >
                            <option value={30}>30 Year</option>
                            <option value={15}>15 Year</option>
                        </select>
                    </div>

                </div>

                {/* Right Column */}
                <div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>HOA Monthly Fees</label>
                        <br />
                        <input
                            type="number"
                            disabled={isLoading}
                            value={hoaMonthlyFees}
                            onChange={(e) => setHoaMonthlyFees(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>Property Tax Rate (%)</label>
                        <br />
                        <input
                            type="number"
                            disabled={isLoading}
                            value={propertyTaxRate}
                            onChange={(e) => setPropertyTaxRate(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>Homeowners Insurance Rate (%)</label>
                        <br />
                        <input
                            type="number"
                            disabled={isLoading}
                            value={homeownersInsuranceRate}
                            onChange={(e) =>
                                setHomeownersInsuranceRate(e.target.value)
                            }
                        />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>PMI Rate (%)</label>
                        <br />
                        <input
                            type="number"
                            disabled={isLoading}
                            value={pmiRate}
                            onChange={(e) => setPmiRate(e.target.value)}
                        />
                    </div>

                </div>

            </div>

            <div style={{ marginTop: "10px" }}>
                <button
                    onClick={calculateAffordability}
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Calculate"}
                </button>

                <button
                    onClick={resetForm}
                    disabled={isLoading}
                    style={{ marginLeft: "10px" }}
                >
                    Reset
                </button>
            </div>

            <div style={{ marginTop: "30px" }}>
                <h2>
                    Estimated Max Home Price: $
                    {result.toLocaleString()}
                </h2>
            </div>

        </div>
    );
}

export default App;