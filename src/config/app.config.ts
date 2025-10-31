export default () => ({
    app: {
        name: process.env.APP_NAME || "marqet-place",
        base_url: process.env.BASE_URL || "http://localhost:3030",
        port: parseInt(process.env.PORT ?? "3030", 10),
        env: process.env.NODE_ENV ?? "development",
    },
    database:{
        url:process.env.DB_URL ?? "your_database_ url"
    },
    hedera:{
        operatorId:process.env.OPERATOR_ID?? 'your_operator_id',
        operatorkey:process.env.OPERATOR_KEY?? 'your_operator_key',
        topicId:process.env.TOPIC_ID?? "your_topic_id"
    }
});
