import * as React from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import Axios from 'axios'

type IMode = 'tagAndEmails' | 'batch' | 'submitting' | 'done' | 'error'
type IFieldName = 'tag' | 'emails'
type IForm = {
  [K in IFieldName]: string
}
interface IBatch {
  tag: string
  emails: string[]
}

const defaultFormdata = () => ({ tag: '', emails: '' })

export const App = () => {
  const [mode, setMode] = React.useState<IMode>('tagAndEmails')
  const [errors, setErrors] = React.useState<string[]>()
  const [formdata, setFormData] = React.useState<IForm>(defaultFormdata())
  const [batchFinal, setBatchFinal] = React.useState<IBatch>()

  const handleGenerateBatch = (e) => {
    e.preventDefault()

    let errors = []

    const cleanEmails = formdata.emails
      .split(/\n|,/)
      .map((e) => e.toLowerCase().trim())
      .filter((e) => {
        // Make sure it is a valid email.
        // Skip and warn in the errors section if not.
        if (e && !/\S+@\S+\.\S+/.test(e)) {
          errors = [...errors, `Invalid email:${e}`]
          return false
        }

        return e
      })

    if (!errors.length && !cleanEmails.length) {
      errors = ['The emails list is empty']
    }

    if (errors.length) {
      setErrors(errors)
      return
    }

    // Create the full batch with the "operations" property
    setBatchFinal({
      tag: formdata.tag,
      emails: cleanEmails,
    })
    setErrors([])
    setMode('batch')
  }

  const handleProcessBatch = async (e) => {
    e.preventDefault()
    setMode('submitting')

    try {
      const response = await Axios.post('http://localhost:3002/batch', batchFinal, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status !== 200) {
        setErrors([`There was a non-200 code returned: ${response.status}. ${response.data}`])
        return
      }

      setMode('done')
    } catch (ex) {
      setErrors([`There was a non-200 code returned: ${ex.response.status}. ${ex.response.data}`])
      return
    }
  }

  const handleRestart = (e) => {
    e.preventDefault()
    setFormData(defaultFormdata())
    setMode('tagAndEmails')
  }

  const handleFieldChange = (fieldName: IFieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formdata, [fieldName]: e.target.value })
  }

  const handleBackToStart = () => {
    setMode('tagAndEmails')
  }

  return (
    <Container fluid>
      <h1>Mailchimp Bulk Tagging</h1>
      <Form
        onSubmit={mode === 'tagAndEmails' ? handleGenerateBatch : mode === 'batch' ? handleProcessBatch : handleRestart}
      >
        {mode === 'tagAndEmails' && (
          <>
            <Form.Group controlId='tag'>
              <Form.Label>Tag to add</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter tag'
                onChange={handleFieldChange('tag')}
                value={formdata.tag}
                required
              />
              <Form.Text className='text-muted'>This tag will be added to each email</Form.Text>
            </Form.Group>
            <Form.Group controlId='emails'>
              <Form.Label>Email Addresses</Form.Label>
              <Form.Control
                type='text'
                as='textarea'
                rows={20}
                placeholder='Enter email list'
                onChange={handleFieldChange('emails')}
                value={formdata.emails}
                required
              />
              <Form.Text className='text-muted'>Separate each email with a comma or new-line</Form.Text>
            </Form.Group>
            <Button variant='primary' type='submit'>
              Generate Batch
            </Button>
          </>
        )}
        {mode === 'batch' && (
          <>
            <Form.Group controlId='batchString'>
              <Form.Label>Batch Commands</Form.Label>
              <Form.Control type='text' as='textarea' rows={20} value={JSON.stringify(batchFinal)} readOnly />
              <Form.Text className='text-muted'>The tag will be added to these emails.</Form.Text>
            </Form.Group>
            <Button variant='primary' type='submit'>
              Process Batch
            </Button>
            <Button variant='secondary' type='button' onClick={handleBackToStart}>
              Back
            </Button>
          </>
        )}
        {mode === 'submitting' && <h2>Submitting...</h2>}
        {mode === 'done' && (
          <>
            <h2>Your batch has been processed by MailChimp.</h2>
            <Button variant='primary' type='submit'>
              Create Another Batch
            </Button>
          </>
        )}
        {errors && (
          <Form.Group controlId='errors'>
            {errors.map((e, i) => (
              <Form.Text key={i} className='text-danger'>
                {e}
              </Form.Text>
            ))}
          </Form.Group>
        )}
      </Form>
    </Container>
  )
}
