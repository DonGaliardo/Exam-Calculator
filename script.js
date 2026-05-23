let forecastChart;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize chart
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    forecastChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Prospects',
                    data: [],
                    backgroundColor: '#64748b',
                    barThickness: 35
                },
                {
                    label: 'Leads',
                    data: [],
                    backgroundColor: '#94a3b8',
                    barThickness: 25
                },
                {
                    label: 'Customers',
                    data: [],
                    backgroundColor: '#cbd5e1',
                    barThickness: 15
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            grouped: false, // This makes the bars overlap instead of sit side-by-side
            plugins: {
                legend: {
                    display: false // hidden corresponding to screenshot
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value + ' people';
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    title: {
                        display: true,
                        text: 'Months',
                        color: '#94a3b8',
                        font: { size: 10 }
                    }
                }
            }
        }
    });

    // Attach event listeners
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initial load
    calculate();
});

function calculate() {
    const revenue = parseFloat(document.getElementById('revenue').value) || 0;
    const aov = parseFloat(document.getElementById('aov').value) || 1;
    const leadRate = parseFloat(document.getElementById('lead-rate').value);
    const prospectRate = parseFloat(document.getElementById('prospect-rate').value);

    // Update slider text values
    document.getElementById('val-lead-rate').innerText = leadRate.toFixed(2) + '%';
    document.getElementById('val-prospect-rate').innerText = prospectRate.toFixed(2) + '%';

    const leadRateDecimal = leadRate / 100;
    const prospectRateDecimal = prospectRate / 100;

    // Core logic matching the toolcards perfectly
    const customers = Math.round(revenue / aov);
    const leads = Math.round(customers / leadRateDecimal);
    const prospects = Math.round(leads / prospectRateDecimal);

    // Update DOM KPI values
    document.getElementById('val-customers').innerText = customers.toLocaleString();
    document.getElementById('val-leads').innerText = leads.toLocaleString();
    document.getElementById('val-prospects').innerText = prospects.toLocaleString();

    // Rates relative to highest amount (Prospects)
    const pctLeads = prospects === 0 ? 0 : Math.round((leads / prospects) * 100);
    const pctCustomers = prospects === 0 ? 0 : Math.round((customers / prospects) * 100);

    document.getElementById('pct-prospects').innerText = '100%';
    document.getElementById('bar-prospects').style.width = '100%';

    document.getElementById('pct-leads').innerText = pctLeads + '%';
    document.getElementById('bar-leads').style.width = pctLeads + '%';

    document.getElementById('pct-customers').innerText = pctCustomers + '%';
    document.getElementById('bar-customers').style.width = pctCustomers + '%';

    // Calculate timescale setup
    const start = new Date(document.getElementById('camp-start').value);
    const end = new Date(document.getElementById('camp-end').value);
    
    let monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (monthsDiff < 1 || isNaN(monthsDiff)) monthsDiff = 1; // minimum 1 month

    // Chart Data computation
    // Simulating linear growth over time, e.g., if total prospects is 125 over 6 months, 
    // M1 = ~21, M2 = ~42 ... M6 = 125. (similar to the image)
    const labels = [];
    const dataP = [];
    const dataL = [];
    const dataC = [];

    for (let i = 1; i <= monthsDiff; i++) {
        labels.push(i.toString()); // Month number
        
        let fraction = i / monthsDiff;
        let p = Math.round(prospects * fraction);
        let l = Math.round(leads * fraction);
        let c = Math.round(customers * fraction);

        dataP.push(p);
        dataL.push(l);
        dataC.push(c);
    }

    // Update Chart
    forecastChart.data.labels = labels;
    forecastChart.data.datasets[0].data = dataP; // Prospects (widest/background)
    forecastChart.data.datasets[1].data = dataL; // Leads
    forecastChart.data.datasets[2].data = dataC; // Customers (narrowest/front)
    
    // Refresh chart graphic
    forecastChart.update();
}
