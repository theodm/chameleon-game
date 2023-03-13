import com.github.gradle.node.npm.task.NpmTask
import net.schmizz.sshj.SSHClient

plugins {
    id("org.hidetake.ssh") version "2.11.2"
}

buildscript { dependencies { classpath("com.hierynomus:sshj:0.32.0") } }

tasks.register("buildFullServer", NpmTask::class.java) {
    dependsOn(":chameleon-client:copyAndBuildClient")
    dependsOn(tasks.getByName("npmInstall"))

    inputs.files(fileTree("node_modules"))
    inputs.files(fileTree("src"))

    inputs.file("package.json")
    inputs.file("package-lock.json")
    inputs.file("tsconfig.json")

    outputs.dir("dist")
    outputs.dir("binary")

    args.set(listOf("run", "package"))
}

tasks.register("deployServer", Task::class.java) {
    this.doLast {
        val ssh = SSHClient()

        ssh.addHostKeyVerifier("da:c8:48:5f:c7:ca:0f:13:89:4e:f9:47:21:51:d1:c6")

        ssh.connect("v2202208181784199083.luckysrv.de")
        ssh.authPassword("root", "wZH7bhh9cREzCGX")

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