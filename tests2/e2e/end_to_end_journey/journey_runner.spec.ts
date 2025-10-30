import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load configuration
const configPath = path.join(__dirname, 'journey_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

test.describe('Journey Test Runner', () => {
  
  test('Run Single User Journey', async ({ page }) => {
    console.log('🎯 Running Single User Journey Test');
    
    // This will run the basic complete user lifecycle
    await test.step('Execute single user journey', async () => {
      // Import and run the complete lifecycle test
      const { execSync } = require('child_process');
      
      try {
        execSync('npx playwright test tests/e2e/end_to_end_journey/complete_user_lifecycle.spec.ts', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Single user journey completed successfully');
      } catch (error) {
        console.error('❌ Single user journey failed:', error);
        throw error;
      }
    });
  });

  test('Run Multi-Package Journey', async ({ browser }) => {
    console.log('🎯 Running Multi-Package Journey Test');
    
    await test.step('Execute multi-package journey', async () => {
      const { execSync } = require('child_process');
      
      try {
        execSync('npx playwright test tests/e2e/end_to_end_journey/advanced_user_journey.spec.ts --grep "Multi-User Journey"', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Multi-package journey completed successfully');
      } catch (error) {
        console.error('❌ Multi-package journey failed:', error);
        throw error;
      }
    });
  });

  test('Run Commission Chain Verification', async ({ browser }) => {
    console.log('🎯 Running Commission Chain Verification');
    
    await test.step('Execute commission chain test', async () => {
      const { execSync } = require('child_process');
      
      try {
        execSync('npx playwright test tests/e2e/end_to_end_journey/advanced_user_journey.spec.ts --grep "Commission Chain"', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Commission chain verification completed successfully');
      } catch (error) {
        console.error('❌ Commission chain verification failed:', error);
        throw error;
      }
    });
  });

  test('Generate Comprehensive Report', async ({ page }) => {
    console.log('📊 Generating Comprehensive Test Report');
    
    await test.step('Compile and generate report', async () => {
      const reportGenerator = new JourneyReportGenerator();
      await reportGenerator.generateComprehensiveReport();
    });
  });
});

class JourneyReportGenerator {
  private testDataDir = path.join(__dirname, 'test_data');
  
  async generateComprehensiveReport(): Promise<void> {
    console.log('📋 Compiling test results...');
    
    // Ensure test data directory exists
    if (!fs.existsSync(this.testDataDir)) {
      fs.mkdirSync(this.testDataDir, { recursive: true });
    }

    // Collect all test result files
    const resultFiles = this.collectResultFiles();
    
    // Generate summary report
    const summaryReport = this.generateSummaryReport(resultFiles);
    
    // Save comprehensive report
    const reportPath = path.join(this.testDataDir, 'comprehensive_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));
    
    // Generate HTML report
    await this.generateHtmlReport(summaryReport);
    
    console.log(`✅ Comprehensive report generated: ${reportPath}`);
    this.printReportSummary(summaryReport);
  }

  private collectResultFiles(): any[] {
    const resultFiles: any[] = [];
    
    try {
      // Look for various result files
      const files = fs.readdirSync(this.testDataDir);
      
      files.forEach(file => {
        if (file.endsWith('.json') && file.includes('journey')) {
          const filePath = path.join(this.testDataDir, file);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            resultFiles.push({ file, data });
          } catch (error) {
            console.log(`⚠️  Could not parse ${file}: ${error}`);
          }
        }
      });
    } catch (error) {
      console.log(`⚠️  Could not read test data directory: ${error}`);
    }
    
    return resultFiles;
  }

  private generateSummaryReport(resultFiles: any[]): any {
    const summary = {
      reportDate: new Date().toISOString(),
      totalTestRuns: resultFiles.length,
      totalUsers: 0,
      successRates: {
        signup: 0,
        activation: 0,
        login: 0,
        order: 0,
        commission: 0
      },
      packageDistribution: {} as any,
      averageExecutionTime: 0,
      errors: [] as string[],
      recommendations: [] as string[]
    };

    let totalUsers = 0;
    let totalSignups = 0;
    let totalActivations = 0;
    let totalLogins = 0;
    let totalOrders = 0;
    let totalCommissions = 0;
    let totalDuration = 0;

    resultFiles.forEach(({ file, data }) => {
      if (Array.isArray(data)) {
        // Handle array of user results
        data.forEach(user => {
          totalUsers++;
          if (user.signupSuccess) totalSignups++;
          if (user.activationSuccess) totalActivations++;
          if (user.loginSuccess) totalLogins++;
          if (user.orderSuccess) totalOrders++;
          if (user.commissionSuccess) totalCommissions++;
          if (user.duration) totalDuration += user.duration;
          
          // Track package distribution
          const packageType = user.userData?.packageType || 'unknown';
          summary.packageDistribution[packageType] = (summary.packageDistribution[packageType] || 0) + 1;
          
          // Collect errors
          if (user.errors && user.errors.length > 0) {
            summary.errors.push(...user.errors);
          }
        });
      } else if (data.results) {
        // Handle report format
        totalUsers += data.totalUsers || 0;
        totalSignups += data.successfulSignups || 0;
        totalActivations += data.successfulActivations || 0;
        totalLogins += data.successfulLogins || 0;
        totalOrders += data.successfulOrders || 0;
        totalCommissions += data.successfulCommissions || 0;
        totalDuration += (data.averageDuration || 0) * (data.totalUsers || 0);
      }
    });

    // Calculate success rates
    if (totalUsers > 0) {
      summary.totalUsers = totalUsers;
      summary.successRates.signup = Math.round((totalSignups / totalUsers) * 100);
      summary.successRates.activation = Math.round((totalActivations / totalUsers) * 100);
      summary.successRates.login = Math.round((totalLogins / totalUsers) * 100);
      summary.successRates.order = Math.round((totalOrders / totalUsers) * 100);
      summary.successRates.commission = Math.round((totalCommissions / totalUsers) * 100);
      summary.averageExecutionTime = Math.round(totalDuration / totalUsers);
    }

    // Generate recommendations
    summary.recommendations = this.generateRecommendations(summary);

    return summary;
  }

  private generateRecommendations(summary: any): string[] {
    const recommendations: string[] = [];

    if (summary.successRates.signup < 90) {
      recommendations.push('Signup success rate is below 90%. Review signup form validation and error handling.');
    }

    if (summary.successRates.activation < 95) {
      recommendations.push('Account activation success rate is below 95%. Check admin activation workflow.');
    }

    if (summary.successRates.order < 80) {
      recommendations.push('Order creation success rate is below 80%. Review store functionality and payment flow.');
    }

    if (summary.averageExecutionTime > 120000) { // 2 minutes
      recommendations.push('Average execution time is high. Consider optimizing test steps and page load times.');
    }

    if (summary.errors.length > summary.totalUsers * 0.1) {
      recommendations.push('High error rate detected. Review common error patterns and improve error handling.');
    }

    if (recommendations.length === 0) {
      recommendations.push('All metrics are within acceptable ranges. Consider expanding test coverage.');
    }

    return recommendations;
  }

  private async generateHtmlReport(summaryReport: any): Promise<void> {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>End-to-End Journey Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .success-rate { color: #28a745; }
        .warning-rate { color: #ffc107; }
        .danger-rate { color: #dc3545; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        .recommendation-item { margin: 10px 0; padding: 5px 0; }
        .package-distribution { display: flex; flex-wrap: wrap; gap: 10px; }
        .package-item { background: #e9ecef; padding: 10px 15px; border-radius: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 End-to-End Journey Test Report</h1>
            <p>Generated on: ${new Date(summaryReport.reportDate).toLocaleString()}</p>
        </div>

        <div class="section">
            <h2>📊 Key Metrics</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${summaryReport.totalUsers}</div>
                    <div class="metric-label">Total Users Tested</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value ${this.getSuccessRateClass(summaryReport.successRates.signup)}">${summaryReport.successRates.signup}%</div>
                    <div class="metric-label">Signup Success Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value ${this.getSuccessRateClass(summaryReport.successRates.activation)}">${summaryReport.successRates.activation}%</div>
                    <div class="metric-label">Activation Success Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value ${this.getSuccessRateClass(summaryReport.successRates.order)}">${summaryReport.successRates.order}%</div>
                    <div class="metric-label">Order Success Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${Math.round(summaryReport.averageExecutionTime / 1000)}s</div>
                    <div class="metric-label">Avg Execution Time</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📦 Package Distribution</h2>
            <div class="package-distribution">
                ${Object.entries(summaryReport.packageDistribution).map(([pkg, count]) => 
                    `<div class="package-item">${pkg}: ${count}</div>`
                ).join('')}
            </div>
        </div>

        <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="recommendations">
                ${summaryReport.recommendations.map((rec: string) => 
                    `<div class="recommendation-item">• ${rec}</div>`
                ).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;

    const htmlPath = path.join(this.testDataDir, 'journey_report.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`📄 HTML report generated: ${htmlPath}`);
  }

  private getSuccessRateClass(rate: number): string {
    if (rate >= 90) return 'success-rate';
    if (rate >= 70) return 'warning-rate';
    return 'danger-rate';
  }

  private printReportSummary(summary: any): void {
    console.log('\n📊 COMPREHENSIVE REPORT SUMMARY:');
    console.log('=====================================');
    console.log(`📈 Total Users Tested: ${summary.totalUsers}`);
    console.log(`✅ Signup Success Rate: ${summary.successRates.signup}%`);
    console.log(`🔐 Activation Success Rate: ${summary.successRates.activation}%`);
    console.log(`🔑 Login Success Rate: ${summary.successRates.login}%`);
    console.log(`🛒 Order Success Rate: ${summary.successRates.order}%`);
    console.log(`💰 Commission Success Rate: ${summary.successRates.commission}%`);
    console.log(`⏱️  Average Execution Time: ${Math.round(summary.averageExecutionTime / 1000)}s`);
    console.log(`📦 Package Distribution:`, summary.packageDistribution);
    console.log(`🔍 Total Errors: ${summary.errors.length}`);
    console.log(`💡 Recommendations: ${summary.recommendations.length}`);
    console.log('=====================================\n');
  }
}