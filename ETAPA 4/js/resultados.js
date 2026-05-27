document.addEventListener('DOMContentLoaded', () => {
    // Histograma de notas (design premium ciano)
    const canvasElement = document.getElementById('graficoNotas');
    if (canvasElement) {
        const labelsRaw = canvasElement.getAttribute('data-histogram-labels');
        const dadosRaw = canvasElement.getAttribute('data-histogram-dados');

        if (labelsRaw && dadosRaw) {
            const labels = JSON.parse(labelsRaw);
            const dados = JSON.parse(dadosRaw);

            new Chart(canvasElement, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Alunos',
                        data: dados,
                        backgroundColor: 'rgba(0, 229, 255, 0.15)',
                        borderColor: '#00e5ff',
                        borderWidth: 2,
                        borderRadius: 4,
                        hoverBackgroundColor: 'rgba(0, 229, 255, 0.4)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#0d131f',
                            titleColor: '#00e5ff',
                            bodyColor: '#ffffff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            callbacks: {
                                label: function (context) {
                                    return context.raw + ' alunos';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a1b0cb',
                                stepSize: 1
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#a1b0cb'
                            }
                        }
                    }
                }
            });
        }
    }
});
