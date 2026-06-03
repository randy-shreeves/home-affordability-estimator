package com.randyshreeves.home_affordability_estimator.service;

import com.randyshreeves.home_affordability_estimator.dto.HomeAffordabilityRequest;
import com.randyshreeves.home_affordability_estimator.dto.HomeAffordabilityResponse;
import org.springframework.stereotype.Service;

/*
 * This class implements the standard fixed-rate mortgage amortization formula:
 * M = P * [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
 * where:
 *   M = monthly payment
 *   P = loan principal
 *   r = monthly interest rate
 *   n = number of payments (months)
 * This implementation rearranges the formula to solve for P (loan principal),
 * allowing the system to estimate the maximum home price based on a target
 * monthly payment and additional cost factors (taxes, insurance, etc.).
 * -------------------------------------------------------------------------
 * Rearranged formula:
 * P = M * [ (1 + r)^n - 1 ] / [ r(1 + r)^n ]
 * -------------------------------------------------------------------------
 */

@Service
public class HomeAffordabilityService {

    public HomeAffordabilityResponse calculateAffordability(HomeAffordabilityRequest request) {
        double desiredMonthlyPayment = request.getMonthlyPayment();
        double downPayment = request.getDownPayment();
        double monthlyInterestRate = request.getInterestRate() / 100 / 12;
        int loanTermMonths = request.getLoanTermYears() * 12;
        double hoaMonthlyFees = request.getHoaMonthlyFees();
        double propertyTaxRate = request.getPropertyTaxRate() / 100 / 12;
        double homeownersInsuranceRate = request.getHomeownersInsuranceRate() / 100 / 12;
        double pmiRate = request.getPmiRate() / 100; // conversion to monthly rate happens later
        double maxHomePrice = calculateMaxHomePrice(
                desiredMonthlyPayment,
                downPayment,
                monthlyInterestRate,
                loanTermMonths,
                hoaMonthlyFees,
                propertyTaxRate,
                homeownersInsuranceRate,
                pmiRate
        );
        long roundedHomePrice = Math.round(maxHomePrice);
        return new HomeAffordabilityResponse(roundedHomePrice);
    }

    private double calculateMaxHomePrice(
            double desiredMonthlyPayment,
            double downPayment,
            double monthlyInterestRate,
            int loanTermMonths,
            double hoaMonthlyFees,
            double propertyTaxRate,
            double homeownersInsuranceRate,
            double pmiRate
    ) {
        // handle invalid mortgage configurations
        if (desiredMonthlyPayment < 0 || loanTermMonths <= 0) {
            return 0;
        }
        double availableMonthlyBudget = desiredMonthlyPayment - hoaMonthlyFees;
        // handle HOA being greater than desired monthly payment
        if (availableMonthlyBudget <= 0) {
            return 0;
        }
        double numerator = calculateNumerator(monthlyInterestRate, loanTermMonths);
        double denominator = calculateDenominator(monthlyInterestRate, loanTermMonths);
        double maxHomePrice;
        // handle edge case if user enters 0% interest rate
        if (numerator == 0) {
            maxHomePrice = availableMonthlyBudget * loanTermMonths;
        } else {
            maxHomePrice = (availableMonthlyBudget * denominator) / numerator;
        }
        maxHomePrice += downPayment;
        double adjustedHomePrice = adjustForAdditionalHousingCosts(
                availableMonthlyBudget,
                maxHomePrice,
                downPayment,
                propertyTaxRate,
                homeownersInsuranceRate,
                monthlyInterestRate,
                loanTermMonths,
                pmiRate
        );
        return adjustedHomePrice;
    }

    private double adjustForAdditionalHousingCosts(
            double desiredMonthlyPayment,
            double maxHomePrice,
            double downPayment,
            double propertyTaxRate,
            double homeownersInsuranceRate,
            double monthlyInterestRate,
            int loanTermMonths,
            double pmiRate
    ) {
        // Reduce affordability until monthly costs reach desired monthly payment
        while (true) {
            double monthlyTaxPayment = maxHomePrice * propertyTaxRate;
            double monthlyInsurancePayment = maxHomePrice * homeownersInsuranceRate;
            double monthlyPmiPayment = calculateMonthlyPmiPayment(maxHomePrice, downPayment, pmiRate);
            double mortgagePayment = calculateMonthlyMortgagePayment(
                    maxHomePrice,
                    downPayment,
                    monthlyInterestRate,
                    loanTermMonths);
            double totalMonthlyCost =
                    mortgagePayment +
                    monthlyTaxPayment +
                    monthlyInsurancePayment +
                    monthlyPmiPayment;
            if (totalMonthlyCost <= desiredMonthlyPayment) {
                return maxHomePrice;
            }
            maxHomePrice--;
        }
    }

    // Numerator of mortgage amortization formula: r(1+r)^n
    private double calculateNumerator(double monthlyInterestRate, int loanTermMonths) {
        return monthlyInterestRate * Math.pow((1 + monthlyInterestRate), loanTermMonths);
    }

    // Denominator of mortgage amortization formula: (1+r)^n - 1
    private double calculateDenominator(double monthlyInterestRate, int loanTermMonths) {
        return Math.pow((1 + monthlyInterestRate), loanTermMonths) - 1;
    }

    private double calculateMonthlyMortgagePayment(
            double homePrice,
            double downPayment,
            double monthlyInterestRate,
            int loanTermMonths
    ) {
        double monthlyPayment;
        double loanAmount = homePrice - downPayment;
        if (monthlyInterestRate == 0) {
            monthlyPayment = loanAmount / loanTermMonths;
        } else {
            double numerator = calculateNumerator(monthlyInterestRate, loanTermMonths);
            double denominator = calculateDenominator(monthlyInterestRate, loanTermMonths);
            monthlyPayment = loanAmount * numerator / denominator;
        }
        return monthlyPayment;
    }

    private double calculateMonthlyPmiPayment(
            double homePrice,
            double downPayment,
            double pmiRate
    ) {
        double loanAmount = homePrice - downPayment;
        // handle edge case if loan amount or home price is 0
        if (loanAmount <= 0 || homePrice <= 0) {
            return 0;
        }
        double loanToValueRatio = loanAmount / homePrice;
        // PMI not required if LTV is less than 80%
        if (loanToValueRatio <= 0.80) {
            return 0;
        }
        double annualPmi = loanAmount * pmiRate;
        return annualPmi / 12;
    }
}
