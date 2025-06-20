<template>
    <div class="dashboard-content">
        <header class="dashboard-header">
            <h1>Seismic Well Data Ingestor</h1>
            <p>Manage your seismic data uploads and processing</p>
        </header>

        <main class="dashboard-main">
            <div class="action-cards">
                <div class="card">
                    <h3>Upload Files</h3>
                    <p>Upload SEGY, LAS and other seismic data files</p>
                    <router-link to="/upload" class="btn btn-primary">
                        Start Upload
                    </router-link>
                </div>

                <div class="card">
                    <h3>View Data</h3>
                    <p>Browse and manage your uploaded files</p>
                    <button class="btn btn-secondary" disabled>
                        Coming Soon
                    </button>
                </div>

                <div class="card">
                    <h3>Process Data</h3>
                    <p>Run processing scripts on your data</p>
                    <button class="btn btn-secondary" disabled>
                        Coming Soon
                    </button>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.dashboard-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: calc(100vh - 104px); /* Subtract header and footer height */
    padding: 2rem;
}

.dashboard-header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
}

.dashboard-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    font-weight: 300;
}

.dashboard-header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.dashboard-main {
    max-width: 1200px;
    margin: 0 auto;
}

.action-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.card h3 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.card p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
    background: #e9ecef;
    color: #6c757d;
}

.btn-secondary:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
</style>