import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Button,
  Table,
  Badge,
  ActionIcon,
  Modal,
  Select,
  TextInput,
  Group,
  Stack,
  Alert,
  Loader,
  Paper,
  Box,
  Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Settings, ExternalLink, Trash2, Plus, Activity, Globe } from 'lucide-react'
import { instanceService } from '../services/instanceService'
import { domainService } from '../services/domainService'
import { Instance, CreateInstanceRequest, AwsSetting, Domain } from '../types'

function Instances() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [settings, setSettings] = useState<AwsSetting[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [opened, { open, close }] = useDisclosure(false)
  const [envOpened, { open: openEnv, close: closeEnv }] = useDisclosure(false)
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)
  const [envName, setEnvName] = useState('')
  const [envValue, setEnvValue] = useState('')
  const [updatingEnv, setUpdatingEnv] = useState(false)
  const [filterRegion, setFilterRegion] = useState<string | null>(null)
  const [newInstance, setNewInstance] = useState<CreateInstanceRequest>({
    region: '',
    city: '',
    instance_type: 't3.small',
    domain: '',
  })
  const [creating, setCreating] = useState(false)
  const [pingStatus, setPingStatus] = useState<Record<number, boolean | null>>({})
  const [pinging, setPinging] = useState<Record<number, boolean>>({})
  const [healthChecking, setHealthChecking] = useState(false)
  const [sniModalOpened, { open: openSniModal, close: closeSniModal }] = useDisclosure(false)
  const [sniDomain, setSniDomain] = useState('')
  const [updatingSni, setUpdatingSni] = useState(false)
  const [rebindModalOpened, { open: openRebindModal, close: closeRebindModal }] = useDisclosure(false)
  const [rebindDomain, setRebindDomain] = useState<string | null>(null)
  const [rebinding, setRebinding] = useState(false)

  const loadInstances = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await instanceService.getInstances(filterRegion || undefined)
      setInstances(data)
    } catch (err) {
      setError('Failed to load instances')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const data = await instanceService.getSettings()
      setSettings(data)
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const loadDomains = async () => {
    try {
      const data = await domainService.getDomains()
      // Filter only active domains
      const activeDomains = data.filter(domain => domain.is_active)
      setDomains(activeDomains)
    } catch (err) {
      console.error('Failed to load domains:', err)
    }
  }

  useEffect(() => {
    loadInstances()
    loadSettings()
  }, [filterRegion])

  useEffect(() => {
    if (opened) {
      loadDomains()
    }
  }, [opened])

  useEffect(() => {
    if (rebindModalOpened) {
      loadDomains()
    }
  }, [rebindModalOpened])

  const handleAddInstance = async () => {
    try {
      setCreating(true)
      setError(null)
      await instanceService.createInstance(newInstance)
      close()
      setNewInstance({
        region: '',
        city: '',
        instance_type: 't3.small',
        domain: '',
      })
      loadInstances()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create instance')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleOpenUrl = (domain: string | null | undefined, webbase: string | null | undefined) => {
    if (domain && webbase) {
      const url = `http://${domain}${webbase}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDeleteInstance = async (id: number) => {
    if (!confirm('Are you sure you want to delete this instance?')) return
    
    try {
      await instanceService.deleteInstance(id)
      loadInstances()
    } catch (err) {
      setError('Failed to delete instance')
      console.error(err)
    }
  }

  const handleOpenEnvDialog = (instance: Instance) => {
    setSelectedInstance(instance)
    setEnvName('')
    setEnvValue('')
    openEnv()
  }

  const handleCloseEnvDialog = () => {
    if (!updatingEnv) {
      closeEnv()
      setSelectedInstance(null)
      setEnvName('')
      setEnvValue('')
    }
  }

  const handleUpdateEnvVariable = async () => {
    if (!selectedInstance || !envName.trim() || !envValue.trim()) {
      setError('Please provide both environment variable name and value')
      return
    }

    try {
      setUpdatingEnv(true)
      setError(null)
      await instanceService.updateEnvVariable(
        selectedInstance.instance_id,
        selectedInstance.region,
        envName.trim(),
        envValue.trim()
      )
      closeEnv()
      setSelectedInstance(null)
      setEnvName('')
      setEnvValue('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update environment variable')
      console.error(err)
    } finally {
      setUpdatingEnv(false)
    }
  }

  const handlePingService = async (instance: Instance) => {
    if (!instance.domain || !instance.webbase) {
      setError('Domain and webbase are required to ping service')
      return
    }

    try {
      setPinging({ ...pinging, [instance.id]: true })
      setError(null)
      const success = await instanceService.pingInstance(instance.domain, instance.webbase)
      setPingStatus({ ...pingStatus, [instance.id]: success })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to ping service')
      setPingStatus({ ...pingStatus, [instance.id]: false })
      console.error(err)
    } finally {
      setPinging({ ...pinging, [instance.id]: false })
    }
  }

  const handleHealthCheckAll = async () => {
    // Filter instances that have domain and webbase
    const instancesToCheck = instances.filter(
      (instance) => instance.domain && instance.webbase
    )

    if (instancesToCheck.length === 0) {
      setError('No instances with domain and webbase to check')
      return
    }

    try {
      setHealthChecking(true)
      setError(null)

      // Set all instances to pinging state
      const initialPinging: Record<number, boolean> = {}
      instancesToCheck.forEach((instance) => {
        initialPinging[instance.id] = true
      })
      setPinging(initialPinging)

      // Ping all instances in parallel
      const pingPromises = instancesToCheck.map(async (instance) => {
        try {
          const success = await instanceService.pingInstance(instance.domain!, instance.webbase!)
          return { id: instance.id, success }
        } catch (err: any) {
          console.error(`Failed to ping instance ${instance.id}:`, err)
          return { id: instance.id, success: false }
        }
      })

      const results = await Promise.all(pingPromises)

      // Update ping status for all instances
      const newPingStatus = { ...pingStatus }
      results.forEach((result) => {
        newPingStatus[result.id] = result.success
      })
      setPingStatus(newPingStatus)
    } catch (err: any) {
      setError('Failed to perform health check on some instances')
      console.error(err)
    } finally {
      setHealthChecking(false)
      // Clear pinging states for instances that were being checked
      setPinging((prev) => {
        const cleared = { ...prev }
        instancesToCheck.forEach((instance) => {
          cleared[instance.id] = false
        })
        return cleared
      })
    }
  }

  const handleUpdateSniAll = () => {
    if (instances.length === 0) {
      setError('No instances to update')
      return
    }
    setSniDomain('')
    openSniModal()
  }

  const handleSubmitSniUpdate = async () => {
    if (!sniDomain.trim()) {
      setError('Please enter a domain name')
      return
    }

    try {
      setUpdatingSni(true)
      setError(null)

      // Loop through all instances on current page
      const updatePromises = instances.map(async (instance) => {
        try {
          await instanceService.updateSni(instance.id, sniDomain.trim())
          return { id: instance.id, success: true }
        } catch (err: any) {
          console.error(`Failed to update SNI for instance ${instance.id}:`, err)
          return { id: instance.id, success: false }
        }
      })

      const results = await Promise.all(updatePromises)
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      if (failCount === 0) {
        closeSniModal()
        setSniDomain('')
        // Optionally reload instances to see updated data
        loadInstances()
      } else {
        setError(`Updated ${successCount} instances successfully, ${failCount} failed`)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update SNI')
      console.error(err)
    } finally {
      setUpdatingSni(false)
    }
  }

  const handleRebindDomain = () => {
    if (instances.length === 0) {
      setError('No instances to rebind')
      return
    }
    setRebindDomain(null)
    openRebindModal()
  }

  const handleSubmitRebindDomain = async () => {
    if (!rebindDomain) {
      setError('Please select a domain')
      return
    }

    try {
      setRebinding(true)
      setError(null)

      // Loop through all instances and call rebind_domain API in parallel
      const rebindPromises = instances.map(async (instance) => {
        try {
          await instanceService.rebindDomain(
            instance.instance_id,
            instance.domain || '',
            rebindDomain,
            instance.region
          )
          return { instanceId: instance.instance_id, success: true }
        } catch (err: any) {
          console.error(`Failed to rebind domain for instance ${instance.instance_id}:`, err)
          return { instanceId: instance.instance_id, success: false, error: err.response?.data?.detail || 'Unknown error' }
        }
      })

      const results = await Promise.all(rebindPromises)
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      if (failCount === 0) {
        closeRebindModal()
        setRebindDomain(null)
        loadInstances()
      } else {
        const failedInstances = results.filter(r => !r.success).map(r => r.instanceId).join(', ')
        setError(`Rebound ${successCount} instances successfully, ${failCount} failed (${failedInstances})`)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to rebind domain')
      console.error(err)
    } finally {
      setRebinding(false)
    }
  }

  const regionOptions = [
    { value: '', label: 'All Regions' },
    { value: 'us-east-1', label: 'us-east-1' },
    { value: 'us-west-2', label: 'us-west-2' },
    { value: 'eu-west-1', label: 'eu-west-1' },
    { value: 'ap-southeast-1', label: 'ap-southeast-1' },
  ]

  const rows = instances.map((instance) => {
    const city = settings.find(s => s.region === instance.region)?.city || '-'
    const pingResult = pingStatus[instance.id]
    const isPinging = pinging[instance.id]
    
    return (
      <Table.Tr key={instance.id}>
        <Table.Td>{instance.instance_id}</Table.Td>
        <Table.Td>{instance.region}</Table.Td>
        <Table.Td>{city}</Table.Td>
    {/*     <Table.Td>{instance.instance_type || '-'}</Table.Td> */}
        <Table.Td>{instance.ipv4 || '-'}</Table.Td>
        <Table.Td>{instance.domain || '-'}</Table.Td>
        <Table.Td>{instance.webbase || '-'}</Table.Td>
        <Table.Td>
          <Badge color={instance.is_active ? 'green' : 'gray'}>
            {instance.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Box
            component="span"
            onClick={() => instance.domain && instance.webbase && !isPinging && handlePingService(instance)}
            style={{ cursor: instance.domain && instance.webbase ? 'pointer' : 'default' }}
          >
            <Badge
              color={pingResult === true ? 'green' : pingResult === false ? 'red' : 'gray'}
            >
              {isPinging ? (
                <Loader size="xs" />
              ) : pingResult === true ? (
                '✅'
              ) : pingResult === false ? (
                '🚩'
              ) : (
                'N/A'
              )}
            </Badge>
          </Box>
        </Table.Td>
     {/*    <Table.Td>
          {new Date(instance.creation_datetime).toLocaleString()}
        </Table.Td> */}
        <Table.Td>
          <Group gap="xs">
            <Tooltip label="Update Environment Variable">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => handleOpenEnvDialog(instance)}
              >
                <Settings size={18} />
              </ActionIcon>
            </Tooltip>
            {instance.domain && instance.webbase && (
              <Tooltip label={`Open http://${instance.domain}/${instance.webbase}`}>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => handleOpenUrl(instance.domain, instance.webbase)}
                >
                  <ExternalLink size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Delete Instance">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleDeleteInstance(instance.id)}
              >
                <Trash2 size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Table.Td>
      </Table.Tr>
    )
  })

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>AWS Instances</Title>
        <Button leftSection={<Plus size={16} />} onClick={open}>
          Add Instance
        </Button>
      </Group>

      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Group mb="md">
        <Select
          label="Filter by Region"
          placeholder="All Regions"
          value={filterRegion}
          onChange={setFilterRegion}
          data={regionOptions}
          clearable
          style={{ minWidth: 200 }}
        />
        <Button
          leftSection={<Activity size={16} />}
          onClick={handleHealthCheckAll}
          disabled={healthChecking || instances.length === 0}
          loading={healthChecking}
          style={{ marginTop: 'auto' }}
        >
          Health Check
        </Button>
        <Button
          leftSection={<Globe size={16} />}
          onClick={handleUpdateSniAll}
          disabled={healthChecking || instances.length === 0 || updatingSni}
          loading={updatingSni}
          style={{ marginTop: 'auto' }}
        >
          Update SNI
        </Button>
        <Button
          leftSection={<Globe size={16} />}
          onClick={handleRebindDomain}
          disabled={healthChecking || instances.length === 0 || rebinding}
          loading={rebinding}
          style={{ marginTop: 'auto' }}
        >
          Rebind Domain
        </Button>
      </Group>

      <Paper shadow="xs" p="md">
        {loading ? (
          <Group justify="center" p="xl">
            <Loader />
          </Group>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Instance ID</Table.Th>
                <Table.Th>Region</Table.Th>
                <Table.Th>City</Table.Th>
    {/*     <Table.Th>Instance Type</Table.Th> */}
                <Table.Th>IPv4</Table.Th>
                <Table.Th>Domain</Table.Th>
                <Table.Th>Webbase</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Service</Table.Th>
            {/*     <Table.Th>Created</Table.Th> */}
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {instances.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={12} style={{ textAlign: 'center' }}>
                    No instances found
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title="Create New AWS Instance"
        centered
        size="md"
      >
        <Stack gap="md">
          <Select
            label="City"
            placeholder="Select a city"
            value={newInstance.city}
            onChange={(value) => {
              const selectedSetting = settings.find(s => s.city === value)
              setNewInstance({ 
                ...newInstance, 
                city: value || '',
                region: selectedSetting?.region || ''
              })
            }}
            data={settings.map(s => ({ value: s.city, label: `${s.city} (${s.region})` }))}
            required
            disabled={creating}
          />
          
          <Select
            label="Instance Type"
            value={newInstance.instance_type}
            onChange={(value) => setNewInstance({ ...newInstance, instance_type: value || 't3.large' })}
            data={[
              { value: 't3.large', label: 't3.large' },
              { value: 't2.xlarge', label: 't2.xlarge' },
              { value: 't3.small', label: 't3.small' },
            ]}
            required
            disabled={creating}
          />
          
          <Select
            label="Domain"
            placeholder="None"
            value={newInstance.domain || null}
            onChange={(value) => setNewInstance({ ...newInstance, domain: value || undefined })}
            data={domains.map(d => ({ value: d.root_domain, label: d.root_domain }))}
            clearable
            disabled={creating}
          />
          
          {creating && (
            <Alert color="blue">
              Creating EC2 instance... This may take a few minutes.
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={close} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleAddInstance}
              disabled={!newInstance.region || !newInstance.city || creating}
              loading={creating}
            >
              Create Instance
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={envOpened}
        onClose={handleCloseEnvDialog}
        title="Update Environment Variable"
        centered
        size="md"
      >
        <Stack gap="md">
          {selectedInstance && (
            <Alert color="blue">
              Instance: {selectedInstance.instance_id} ({selectedInstance.region})
            </Alert>
          )}
          <TextInput
            label="Variable Name"
            placeholder="e.g., API_KEY"
            value={envName}
            onChange={(e) => setEnvName(e.target.value)}
            disabled={updatingEnv}
            required
          />
          <TextInput
            label="Variable Value"
            placeholder="e.g., your-secret-value"
            value={envValue}
            onChange={(e) => setEnvValue(e.target.value)}
            disabled={updatingEnv}
            required
            multiline
            rows={3}
          />
          {updatingEnv && (
            <Alert color="blue">
              Updating environment variable... This may take a few moments.
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCloseEnvDialog} disabled={updatingEnv}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEnvVariable}
              disabled={!envName.trim() || !envValue.trim() || updatingEnv}
              loading={updatingEnv}
            >
              Update
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={sniModalOpened}
        onClose={closeSniModal}
        title="Update SNI for All Instances"
        centered
        size="md"
      >
        <Stack gap="md">
          <Alert color="blue">
            This will update SNI for {instances.length} instance(s) on the current page.
          </Alert>
          <TextInput
            label="SNI Domain"
            placeholder="e.g., cloudflare.com"
            value={sniDomain}
            onChange={(e) => setSniDomain(e.target.value)}
            disabled={updatingSni}
            required
            description="Enter the domain name to use as SNI"
          />
          {updatingSni && (
            <Alert color="blue">
              Updating SNI for all instances... This may take a few moments.
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeSniModal} disabled={updatingSni}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSniUpdate}
              disabled={!sniDomain.trim() || updatingSni}
              loading={updatingSni}
            >
              Update SNI
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={rebindModalOpened}
        onClose={closeRebindModal}
        title="Rebind Domain for All Instances"
        centered
        size="md"
      >
        <Stack gap="md">
          <Alert color="blue">
            This will rebind domain for {instances.length} instance(s) on the current page.
            This is a long-running operation that may take several minutes.
          </Alert>
          <Select
            label="New Domain"
            placeholder="Select a domain"
            value={rebindDomain}
            onChange={(value) => setRebindDomain(value)}
            data={domains.map(d => ({ value: d.root_domain, label: d.root_domain }))}
            disabled={rebinding}
            required
            description="Select the new domain to bind to all instances"
          />
          {rebinding && (
            <Alert color="blue">
              Rebinding domains for all instances... This may take several minutes.
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeRebindModal} disabled={rebinding}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRebindDomain}
              disabled={!rebindDomain || rebinding}
              loading={rebinding}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}

export default Instances
