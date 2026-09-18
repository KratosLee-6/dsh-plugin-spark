# Security / 安全说明

Do not put secrets or exploit details affecting other users in a public issue. If GitHub private vulnerability reporting is available on this repository, use **Security → Report a vulnerability**. Otherwise, open a minimal issue asking for a private contact method without including the exploit or private data. There is no guaranteed response SLA.

请不要在公开 Issue 中放入密钥或可能影响其他用户的利用细节。如仓库已开启 GitHub 私密漏洞报告，请使用 **Security → Report a vulnerability**；否则先发不含利用细节和私密数据的简短 Issue，询问私下联系渠道。本项目暂不承诺响应时限。

Spark is a local tool, not a security boundary against the account running it. The database is plaintext. Review exported Skill instructions before execution in another host. Spark's no-network engine does not prevent DSH from forwarding tool results to its configured cloud model.

Spark 是本地工具，不防范以同一账户运行的恶意进程。数据库为明文。导出的 Skill 在其他宿主执行前必须审阅。Spark 核心不联网，并不阻止 DSH 将工具结果发送给其配置的云模型。
