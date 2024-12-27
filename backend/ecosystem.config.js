module.exports = {
    apps: [
        {
            name: "quintus-backend",
            script: "./dist/listener.js",
            env_production: {
                NODE_ENV: "production",
            },
            watch: false,
            max_memory_restart: "500M",
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            error_file: "./logs/pm2-error.log",
            out_file: "./logs/pm2-out.log",
        },
    ],
};
