import com.github.gradle.node.npm.task.NpmTask
import net.schmizz.sshj.SSHClient
import java.util.*

plugins {
    id("org.hidetake.ssh") version "2.11.2"
}

buildscript { dependencies { classpath("com.hierynomus:sshj:0.32.0") } }

tasks.register("buildFullServer", NpmTask::class.java) {
    dependsOn("npmInstall")
    dependsOn(":chameleon-client:copyAndBuildClient")

    inputs.files(fileTree("node_modules"))
    inputs.files(fileTree("src"))
    // ToDo: /dist/client besser in /client umziehen
    inputs.files(fileTree("dist/client"))

    inputs.file("package.json")
    inputs.file("package-lock.json")
    inputs.file("tsconfig.json")

    outputs.dir("dist")
    outputs.dir("binary")

    args.set(listOf("run", "package"))
}

tasks.register("deployServer", Task::class.java) {
    dependsOn("buildFullServer")

    this.doLast {
        val ssh = SSHClient()

        val props = Properties()
            .apply {
                load(rootDir.resolve("keys.properties").inputStream())
            }

        ssh.addHostKeyVerifier(props["DEPLOY_HOST_KEY_VERIFIER"].toString())

        ssh.connect(props["DEPLOY_HOST"].toString())
        ssh.authPassword(props["DEPLOY_HOST_USER"].toString(), props["DEPLOY_HOST_PASSWORD"].toString())

        try {
            fun exec(cmd: String) {
                val session = ssh.startSession()

                session
                    .exec(cmd)
                    .join()
            }

            exec("sudo mkdir /home/apps/chameleon -p")

            exec("sudo chmod a+rwx /home/apps")
            exec("sudo chmod a+rwx /home/apps/chameleon")

            exec("sudo systemctl stop chameleon")
            exec("sudo useradd chameleon")
            exec("sudo groupadd chameleon")
            exec("sudo usermod -a -G chameleon chameleon")

            ssh.newSCPFileTransfer().upload(projectDir.resolve("binary").resolve("chameleon-server-linux").absolutePath, "/home/apps/chameleon/chameleon-server-linux")

            exec("sudo chmod a+x /home/apps/chameleon/chameleon-server-linux")

            ssh.newSCPFileTransfer().upload(projectDir.resolve("chameleon.service").absolutePath, "/etc/systemd/system/chameleon.service")

            exec("sudo systemctl enable chameleon")
            exec("sudo systemctl start chameleon")
        } finally {
            ssh.disconnect()
        }
    }
}